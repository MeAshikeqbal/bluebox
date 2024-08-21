import { Outlet, useLocation } from "@remix-run/react";
import ChatSideBar from "~/components/chatSideBar";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "~/components/ui/resizable";
import EmptyChat from "~/components/chatWindow/emptychat";



export default function Layout() {
    const location = useLocation();    
    
    return (
        <>
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25} maxSize={50} minSize={15}>
                    <ChatSideBar />
                </ResizablePanel>
                <ResizableHandle className="h-screen" />
                <ResizablePanel
                    className="bg-[url('/background.svg')] bg-cover bg-center h-screen w-screen gackgroud"
                    defaultSize={75}
                >
                    {location.pathname.match(/^\/chat\/?$/) ? <EmptyChat /> : <Outlet />}
                </ResizablePanel>
            </ResizablePanelGroup>
        </>
    );

}
