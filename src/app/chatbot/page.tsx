import { ChatView } from "@/components/chatbot/chat-view";

export default function ChatbotPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <ChatView />
        </div>
    );
}
