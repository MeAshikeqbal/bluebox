import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function Profile() {
    return(
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
        </DropdownMenuContent>
    </DropdownMenu>

    )
}