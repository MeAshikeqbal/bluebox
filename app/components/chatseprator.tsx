import{ ResizablePanelGroup, ResizablePanel, ResizableHandle } from '~/components/ui/resizable';
import ChatSideBar from './chatSideBar';
export default function ChatSeparator() {
    return (
        <ResizablePanelGroup direction='horizontal'>
        <ResizablePanel defaultSize={25}>
            <ChatSideBar />
        </ResizablePanel>
        <ResizableHandle
        className='h-screen'
        />
        <ResizablePanel>Two</ResizablePanel>
      </ResizablePanelGroup>
      )
}