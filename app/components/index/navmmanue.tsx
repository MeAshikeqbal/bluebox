import { cn } from "~/lib/utils";
import { HoveredLink, Menu, MenuItem, ProductItem } from "../ui/navbar-menu";
import { useState } from "react";


export default function NavMenu() {
    const [active, setActive] = useState<string | null>(null);
    return (

        <div
            className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50")}
        >
            <Menu setActive={setActive}>
                <MenuItem setActive={setActive} active={active} item="Chat">
                    <ProductItem
                        title="Chat"
                        description="Chat with your friends"
                        href={"/chat"}
                        src={""}
                    />
                </MenuItem>
            </Menu>
        </div>
    )
}