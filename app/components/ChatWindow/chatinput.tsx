import { useState } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

export default function ChatInput() {
    const [inputStr, setInputStr] = useState("");

    return (
        <div className="relative flex items-center p-2 border-t bg-white">
            {/* Emoji Picker Button */}
{/*            <Button
                variant={"outline"}
                className="mr-2"
                onClick={() => setShowPicker((val) => !val)}
                aria-label="Toggle emoji picker"
            >
                <Smile size={16} />
            </Button> */}

            {/* Attach File Button */}
            <Button
                variant="outline"
                className="mr-2"
                aria-label="Attach file"
            >
                <Paperclip size={16} />
            </Button>

            {/* Textarea */}
            <Textarea
                className="flex-1 resize-none rounded-md p-2 border-none focus:outline-none focus:ring-0"
                placeholder="Type a message..."
                value={inputStr}
                onChange={(e) => setInputStr(e.target.value)}
            />

            {/* Send Button */}
            <Button className="ml-2" aria-label="Send message">
                <SendHorizontal size={16} />
            </Button>

        </div>
    );
}
