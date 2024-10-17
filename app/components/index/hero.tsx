import { FlipWords } from "../ui/flip-words";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "../ui/hero-highlight";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import { Link } from "@remix-run/react";


export default function Hero() {
  const words = ["secure", "fast", "easy", "web3"];

    return (
      <HeroHighlight
      className="flex flex-col justify-center items-center h-screen space-y-4"
      >
      <motion.h1
        className="text-2xl px-4 md:text-4xl lg:text-5xl font-bold text-neutral-700 dark:text-white leading-relaxed lg:leading-snug text-center mx-auto "
      >
        A<FlipWords words={words} /><Highlight>chat</Highlight> app for the modern web.

      </motion.h1>
          <HoverBorderGradient>
          <Link to="/chat" className="text-white text-lg font-bold">
            Start Chatting
          </Link>
        </HoverBorderGradient>
    </HeroHighlight>  
    );
}