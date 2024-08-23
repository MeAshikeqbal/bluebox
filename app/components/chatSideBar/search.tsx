import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "~/components/ui/command";
import { Button } from "../ui/button";
import React from "react";
import SettingsDialog from "./settingsdialog";

export default function ChatSearch() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div
      className="flex items-center justify-between w-full space-x-1"
      >
        <SettingsDialog />
        <Button
          className="flex items-center justify-between w-full rounded-l-none"
          variant={"outline"} onClick={() => setOpen((open) => !open)}>
          <span>Search</span>
          <CommandShortcut>Ctrl + K</CommandShortcut>
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found</CommandEmpty>
            <CommandGroup title="Channels">
              <CommandItem>
                General
                <CommandShortcut>Ctrl + 1</CommandShortcut>
              </CommandItem>
              <CommandItem>
                Random
                <CommandShortcut>Ctrl + 2</CommandShortcut>
              </CommandItem>
              <CommandItem>
                Design
                <CommandShortcut>Ctrl + 3</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
