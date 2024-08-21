import Profile from "./profile";

export default function Navbar() {
    return (
        <div
            className="flex justify-between items-center bg-secondary/80 p-4"
        >
            <div
                className="flex items-center"
            >
                <h1
                    className="text-lg font-semibold"
                >
                    Chat App
                </h1>
            </div>
            <Profile />
        </div>
    );
}