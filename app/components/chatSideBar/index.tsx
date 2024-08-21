import ChatSearch from "./search";
import PeopleList from "./peoplelist";

export default function ChatSideBar() {
    return (
        <nav className="p-4">
            <ChatSearch />
            <PeopleList />
        </nav>
    );
}
