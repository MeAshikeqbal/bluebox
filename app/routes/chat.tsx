import { Outlet, useLocation } from "@remix-run/react";
import ChatSideBar from "~/components/chatSideBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import EmptyChat from "~/components/chatWindow/emptychat"; // Import your EmptyChat component

export default function Layout() {
    const location = useLocation();

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25}>
                <ChatSideBar />
            </ResizablePanel>
            <ResizableHandle className="h-screen" />
            <ResizablePanel>
                {location.pathname === "/chat/" ? <EmptyChat /> : <Outlet />}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}
