"use client";

import { IncomingCallDialog } from "./incoming-call-dialog";
import { CallView } from "./call-view";

export function CallOverlay() {
  return (
    <>
      <IncomingCallDialog />
      <CallView />
    </>
  );
}
