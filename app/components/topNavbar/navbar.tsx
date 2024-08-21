import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

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
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Avatar
                        className="cursor-pointer"
                    >
                        <AvatarImage src="https://avatars.githubusercontent.com/u/35164664?v=4" />
                        <AvatarFallback>AS</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    );
}