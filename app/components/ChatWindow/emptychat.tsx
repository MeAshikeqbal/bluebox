export default function EmptyChat() {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-muted-foreground/85">
                        No chat selected
                    </h1>
                    <p className=" mt-2 text-muted-foreground/50">
                        Select a chat to start messaging
                    </p>
                </div>
            </div>
        </div>
    );
}