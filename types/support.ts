export type TSupportAuthorRole = "user" | "support" | "system";

export interface TSupportChatMessage {
  id: string;
  authorRole: TSupportAuthorRole;
  text: string;
  createdAt: string;
}

/** open — waits for support, answered — support replied, closed — final. */
export type TSupportTicketStatus = "open" | "answered" | "closed";

export interface TSupportTopic {
  id: number;
  name: string;
  needsOrder: boolean;
}

export interface TSupportTicket {
  id: number;
  status: TSupportTicketStatus;
  topicName: string | null;
  orderCode: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  createdAt: string | null;
  closedAt: string | null;
}

export interface TNewSupportTicket {
  topicId: number;
  orderCode?: string;
  text: string;
}
