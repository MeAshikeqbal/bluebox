import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"
import { Menu } from "lucide-react";

export default function settingsdialog() {
    return (
        <Dialog>
                <DialogTrigger
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-l-md p-2    "
                >
                    <Menu 
                    height={22}
                    width={22}
                    />
                </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}