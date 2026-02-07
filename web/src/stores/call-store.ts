import { create } from "zustand";
import { CallStatus } from "@/types";
import type { IncomingCallData, CallTokenData } from "@/types";
import { initiateCall, joinCall, endCallApi } from "@/lib/api/calls";
import {
  initiateCallSignalR,
  acceptCallSignalR,
  rejectCallSignalR,
  endCallSignalR,
} from "@/lib/signalr/client";

interface CallState {
  status: CallStatus;
  conversationId: string | null;
  isVideo: boolean;
  token: string | null;
  liveKitUrl: string | null;
  roomName: string | null;
  incomingCall: IncomingCallData | null;
  callStartedAt: number | null;
  error: string | null;

  startCall: (conversationId: string, isVideo: boolean) => Promise<void>;
  acceptIncomingCall: () => Promise<void>;
  rejectIncomingCall: () => Promise<void>;
  endCurrentCall: () => Promise<void>;
  setIncomingCall: (data: IncomingCallData) => void;
  onCallAccepted: (conversationId: string) => void;
  onCallRejected: (conversationId: string) => void;
  onCallEnded: (conversationId: string) => void;
  reset: () => void;
}

const initialState = {
  status: CallStatus.Idle,
  conversationId: null,
  isVideo: false,
  token: null,
  liveKitUrl: null,
  roomName: null,
  incomingCall: null,
  callStartedAt: null,
  error: null,
};

export const useCallStore = create<CallState>((set, get) => ({
  ...initialState,

  startCall: async (conversationId, isVideo) => {
    set({ status: CallStatus.Initiating, conversationId, isVideo, error: null });
    try {
      const response = await initiateCall(conversationId, isVideo);
      if (!response.success || !response.data) {
        set({ status: CallStatus.Idle, error: response.errors[0] ?? "Failed to initiate call" });
        return;
      }
      await initiateCallSignalR(conversationId, isVideo);
      set({ status: CallStatus.Ringing, roomName: response.data.roomName });
    } catch {
      set({ status: CallStatus.Idle, error: "Failed to start call" });
    }
  },

  acceptIncomingCall: async () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    set({
      status: CallStatus.Connecting,
      conversationId: incomingCall.conversationId,
      isVideo: incomingCall.isVideo,
      error: null,
    });

    try {
      await acceptCallSignalR(incomingCall.conversationId);
      const tokenResponse = await joinCall(incomingCall.conversationId);
      if (!tokenResponse.success || !tokenResponse.data) {
        set({ ...initialState, error: tokenResponse.errors[0] ?? "Failed to join call" });
        return;
      }
      const tokenData = tokenResponse.data as CallTokenData;
      set({
        status: CallStatus.Connected,
        token: tokenData.token,
        liveKitUrl: tokenData.liveKitUrl,
        roomName: tokenData.roomName,
        incomingCall: null,
        callStartedAt: Date.now(),
      });
    } catch {
      set({ ...initialState, error: "Failed to accept call" });
    }
  },

  rejectIncomingCall: async () => {
    const { incomingCall } = get();
    if (!incomingCall) return;

    try {
      await rejectCallSignalR(incomingCall.conversationId);
    } finally {
      set({ incomingCall: null });
    }
  },

  endCurrentCall: async () => {
    const { conversationId } = get();
    if (!conversationId) return;

    try {
      await endCallSignalR(conversationId);
      await endCallApi(conversationId);
    } finally {
      set(initialState);
    }
  },

  setIncomingCall: (data) => {
    const { status } = get();
    if (status !== CallStatus.Idle) return;
    set({ incomingCall: data });
  },

  onCallAccepted: async (conversationId) => {
    const state = get();
    if (state.conversationId !== conversationId) return;
    if (state.status !== CallStatus.Ringing) return;

    set({ status: CallStatus.Connecting });
    try {
      const tokenResponse = await joinCall(conversationId);
      if (!tokenResponse.success || !tokenResponse.data) {
        set({ ...initialState, error: "Failed to join call" });
        return;
      }
      const tokenData = tokenResponse.data as CallTokenData;
      set({
        status: CallStatus.Connected,
        token: tokenData.token,
        liveKitUrl: tokenData.liveKitUrl,
        roomName: tokenData.roomName,
        callStartedAt: Date.now(),
      });
    } catch {
      set({ ...initialState, error: "Failed to connect to call" });
    }
  },

  onCallRejected: (conversationId) => {
    const state = get();
    if (state.conversationId !== conversationId) return;
    if (state.status === CallStatus.Ringing) {
      set(initialState);
    }
  },

  onCallEnded: (conversationId) => {
    const state = get();
    if (
      state.conversationId === conversationId ||
      state.incomingCall?.conversationId === conversationId
    ) {
      set(initialState);
    }
  },

  reset: () => set(initialState),
}));
