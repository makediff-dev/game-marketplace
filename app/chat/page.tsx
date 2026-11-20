import { Suspense } from "react";

import { ChatScreen } from "@/components/chat-screen";
import { ListPageSkeleton } from "@/components/skeleton";

// Personal page: no shared caching.
export const dynamic = "force-dynamic";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <section aria-label="Чаты">
          <ListPageSkeleton rows={6} />
        </section>
      }
    >
      <ChatScreen />
    </Suspense>
  );
}
