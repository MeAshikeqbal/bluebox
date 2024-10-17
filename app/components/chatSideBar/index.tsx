import ChatSearch from "./search";
import PeopleList from "./peoplelist";
import SideManuBar from "./sidemanusbar";

export default function ChatSideBar() {
    return (
        <div
        className="flex flex-row h-full w-full"
        >
        <SideManuBar />
        <nav className="p-4 w-full">
            <ChatSearch />
            <PeopleList />
        </nav>
        </div>
    );
}
