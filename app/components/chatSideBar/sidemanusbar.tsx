import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { IconBrandTabler, IconUserBolt, IconSettings, IconArrowLeft } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function SideManuBar() {
    const [open, setOpen] = useState(false);
    const links = [
        {
            label: "Chat",
            to: "#",
            icon: (
                <IconBrandTabler className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Profile",
            to: "#",
            icon: (
                <IconUserBolt className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Settings",
            to: "#",
            icon: (
                <IconSettings className="h-5 w-5 flex-shrink-0" />
            ),
        },
        {
            label: "Logout",
            to: "#",
            icon: (
                <IconArrowLeft className="h-5 w-5 flex-shrink-0" />
            ),
        },
    ];

    return (
        <Sidebar
            open={open}
            setOpen={setOpen}
            animate={true}
        >
            <SidebarBody className="justify-between gap-10">
                <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                    <div className="flex flex-col gap-2">
                        {links.map((link, idx) => (
                            <SidebarLink key={idx} link={link} />
                        ))}
                    </div>
                </div>
                <div>
                    <SidebarLink
                        link={{
                            label: "Manu Arora",
                            to: "/",
                            icon: (
                                <Avatar
                                className="w-8 h-8"
                                >
                                    <AvatarImage src="https://avatars.githubusercontent.com/u/35164664?v=4" />
                                    <AvatarFallback>AS</AvatarFallback>
                                </Avatar>
                            ),
                        }}
                    />
                </div>
            </SidebarBody>
        </Sidebar>
    )
}