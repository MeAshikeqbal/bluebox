import { Link } from "@remix-run/react";

export default function Index() {
    return (
        <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-4xl font-semibold">Welcome to Chat App</h1>
        <Link to="/chat" className="text-blue-500 underline">Go to Chat</Link>
        </div>
    );
}