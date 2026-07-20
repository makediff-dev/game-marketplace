import { AuthenticatedNavbar } from "@/components/layout/authenticated-navbar/authenticated-navbar";
import { ChatContent } from "@/components/chat/chat-content/chat-content";
import { Footer } from "@/components/footer/footer/footer";

export default function ChatPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AuthenticatedNavbar />
        <ChatContent />
        <Footer />
      </div>
    </div>
  );
}
