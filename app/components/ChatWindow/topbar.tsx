import { Minimize2, PhoneCallIcon } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Link } from "@remix-run/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function TopBar() {
    return (
        <>
            <div
                className="flex items-center justify-between bg-primary-foreground text-primary-background"
            >
                <div className="flex items-center space-x-4 p-2">
                    <Avatar className="m-2">
                        <img
                            src="https://avatars.githubusercontent.com/u/35164664?v=4"
                            alt="Ashik Eqbal"
                        />
                    </Avatar>
                    <div className="flex flex-col">
                        <h2 className="text-md font-semibold">Ashik Eqbal</h2>
                        <p className="text-sm text-muted-foreground">typing...</p>
                    </div>
                </div>
                <div
                    className="flex items-center p-2 space-x-2 mr-14"
                >
                    <PhoneCallIcon className="h-6 w-6 m-2" />
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Link to="/chat">
                                    <Minimize2 className="h-6 w-6" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Exit Chat</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <Separator />
        </>
    );
}