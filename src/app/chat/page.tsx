import { AppNavbar } from "@/components/layout/app-navbar/app-navbar";
import { ChatContent } from "@/components/chat/chat-content/chat-content";
import { Footer } from "@/components/footer/footer/footer";

export default function ChatPage() {
  return (
    <div className="container">
      <div className="pageContent">
        <AppNavbar />
        <ChatContent />
        <Footer />
      </div>
    </div>
  );
}
