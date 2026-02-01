import { motion } from "framer-motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/routes/-shadcn/components/ui/avatar";

const AVATAR_HOVER_SCALE = 1.05;
const AVATAR_INITIAL_ROTATION = 5;

export function HeroAvatar() {
  return (
    <motion.div
      className="rounded-3xl"
      initial={{
        boxShadow:
          "0 0 20px 5px color-mix(in srgb, var(--color-indigo-500) 20%, transparent)",
        rotate: AVATAR_INITIAL_ROTATION,
      }}
      transition={{ stiffness: 300, type: "spring" }}
      whileHover={{
        boxShadow:
          "0 0 60px 25px color-mix(in srgb, var(--color-indigo-500) 70%, transparent)",
        rotate: 0,
        scale: AVATAR_HOVER_SCALE,
      }}
    >
      <Avatar className="size-40 rounded-3xl shadow-2xl after:rounded-3xl">
        <AvatarImage alt="Manthan" className="rounded-3xl" src="/me.jpg" />
        <AvatarFallback className="rounded-3xl bg-foreground font-bold font-serif text-6xl text-background md:text-7xl">
          m
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );
}
