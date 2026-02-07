import { apiClient } from "./client";
import type { PagedResult, SearchResult } from "@/types";

export interface SearchMessagesParams {
  q: string;
  conversationId?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function searchMessages(params: SearchMessagesParams) {
  const searchParams = new URLSearchParams({ q: params.q });
  if (params.conversationId) searchParams.set("conversationId", params.conversationId);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.pageSize) searchParams.set("pageSize", params.pageSize.toString());

  return apiClient.get<PagedResult<SearchResult>>(
    `/messages/search?${searchParams.toString()}`
  );
}
