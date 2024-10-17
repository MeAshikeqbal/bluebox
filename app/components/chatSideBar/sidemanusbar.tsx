import { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { IconBrandTabler, IconUserBolt, IconSettings, IconArrowLeft } from "@tabler/icons-react";
import { getAuth } from '@clerk/remix/ssr.server'
import { UserButton } from "@clerk/remix";
import { LoaderFunction, redirect } from "@remix-run/node";
import { createClerkClient } from "@clerk/remix/api.server";
import { useLoaderData } from "@remix-run/react";

type LoaderData = {
  serialisedUser: string;
};

export const loader: LoaderFunction = async (args) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect('/sign-in?redirect_url=' + args.request.url);
  }

  const user = await createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY }).users.getUser(
    userId,
  );

  return { serialisedUser: JSON.stringify(user) };
};

export default function SideManuBar() {
  // Destructure and parse the serialized user data
  const { serialisedUser } = useLoaderData<LoaderData>();
  const user = JSON.parse(serialisedUser);

  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Chat",
      to: "#",
      icon: <IconBrandTabler className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Profile",
      to: "#",
      icon: <IconUserBolt className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      to: "#",
      icon: <IconSettings className="h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      to: "#",
      icon: <IconArrowLeft className="h-5 w-5 flex-shrink-0" />,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div>
          <UserButton />
          <p>{user.id}</p> {/* Display the user ID from the parsed user object */}
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
