export default function EmptyChat() {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-gray-700">
                        No chat selected
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Select a chat to start messaging
                    </p>
                </div>
            </div>
        </div>
    );
}