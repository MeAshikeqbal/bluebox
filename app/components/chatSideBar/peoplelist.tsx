import { Link } from "@remix-run/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator"
import { Badge } from "../ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu"


export default function peopleList() {

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <Link to={`/chat/123`}
            className="flex p-1 mt-2 items-center hover:bg-secondary/60 rounded-lg"
          >
            <Avatar className="m-2">
              <AvatarImage src="https://avatars.githubusercontent.com/u/35164664?v=4" />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div
              className="flex justify-between w-full items-center"
            >
              <div>
                <h2 className="text-md font-semibold">Ashik Eqbal</h2>
                <p
                  className="text-sm text-muted-foreground"
                >
                  typing...
                </p>
              </div>
              <Badge
                variant="active"

              >
                2
              </Badge>
            </div>
          </Link>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            Profile
          </ContextMenuItem>
          <ContextMenuItem>
            Hide
          </ContextMenuItem>
          <ContextMenuItem>
            Delete
          </ContextMenuItem>
          <ContextMenuItem>
            Block
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Separator
        className="mt-2"
      />
    </>
  );
}
