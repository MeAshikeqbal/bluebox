import ChatInput from "./chatinput";
import ChatMessages from "./chatmessages";
import TopBar from "./topbar";

export default function ChatWindow() {
    return (
        <div className="flex flex-col h-screen">
            <TopBar />
            <div
                className="flex-1 overflow-hidden flex flex-col"
            >
                <ChatMessages />
                <ChatInput />
            </div>
        </div>
    );
}
