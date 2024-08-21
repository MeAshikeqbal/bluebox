import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Paperclip, SendHorizontal, Smile } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import Picker , {
    EmojiClickData, 
    Theme,
    EmojiStyle 
} from "emoji-picker-react";


export default function ChatInput() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [inputStr, setInputStr] = useState<string>("");
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const onEmojiClick = (emojiObject: EmojiClickData) => {
        setInputStr((prevInput) => prevInput + emojiObject.emoji);
        setShowPicker(false);
    };


    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputStr]);

    const handleSendMessage = () => {
        if (inputStr.trim() === "") return;
        console.log("Message sent:", inputStr);
        setInputStr(""); // Clear the input after sending
        setShowPicker(false); // Hide emoji picker after sending
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputStr(e.target.value);
    };

    return (
        <>
            <Separator />
            <div className="flex items-center space-x-2 p-2">
                <Button variant="ghost" className="p-2">
                    <Paperclip className="w-5 h-5" />
                </Button>
                <div className="relative">
                    <Button
                        variant="ghost"
                        className="p-2"
                        onClick={() => setShowPicker((val) => !val)}
                    >
                        <Smile className="w-5 h-5" />
                    </Button>
                    {showPicker && (
                        <div className="absolute bottom-10">
                            <Picker
                                onEmojiClick={onEmojiClick}
                                theme={"dark" as Theme}
                                emojiStyle={"native" as EmojiStyle}
                                autoFocusSearch={true}
                                width={350}
                                height={450}
                            />
                        </div>
                    )}
                </div>
                <Textarea
                    ref={textareaRef}
                    className="w-full resize-none overflow-hidden rounded-md p-2 border-none outline-none ring-0 bg-muted/50"
                    placeholder="Type a message..."
                    value={inputStr}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    rows={1}
                    style={{ minHeight: "auto", lineHeight: "1.5" }}
                />
                <Button
                    variant="link"
                    className="p-2"
                    onClick={handleSendMessage}
                    disabled={inputStr.trim() === ""}
                >
                    <SendHorizontal className="w-5 h-5" />
                </Button>
            </div>
        </>
    );
}
