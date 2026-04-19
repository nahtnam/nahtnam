import { useCallback, useState, type PointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AVATAR_HOVER_SCALE = 1.03;
const ROTATION_RANGE = 14;
const SHINE_SIZE = 34;

export function HeroAvatar() {
  const [isActive, setIsActive] = useState(false);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const offsetY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);
  const shineOpacity = useMotionValue(0);

  const smoothRotateX = useSpring(rotateX, {
    damping: 18,
    stiffness: 220,
  });
  const smoothRotateY = useSpring(rotateY, {
    damping: 18,
    stiffness: 220,
  });
  const smoothScale = useSpring(scale, {
    damping: 16,
    stiffness: 240,
  });
  const smoothOffsetY = useSpring(offsetY, {
    damping: 18,
    stiffness: 220,
  });
  const smoothShineOpacity = useSpring(shineOpacity, {
    damping: 20,
    stiffness: 220,
  });

  const shineBackground = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.88), rgba(255,255,255,0.42) ${SHINE_SIZE}%, rgba(255,255,255,0.08) 56%, transparent 74%)`;

  const resetTilt = useCallback(() => {
    setIsActive(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    offsetY.set(0);
    shineOpacity.set(0);
    shineX.set(50);
    shineY.set(50);
  }, [offsetY, rotateX, rotateY, scale, shineOpacity, shineX, shineY]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLSpanElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      setIsActive(true);
      rotateX.set((0.5 - y) * ROTATION_RANGE);
      rotateY.set((x - 0.5) * ROTATION_RANGE);
      scale.set(AVATAR_HOVER_SCALE);
      offsetY.set(-4);
      shineOpacity.set(1);
      shineX.set(x * 100);
      shineY.set(y * 100);
    },
    [offsetY, rotateX, rotateY, scale, shineOpacity, shineX, shineY],
  );

  const handlePointerEnter = useCallback(() => {
    setIsActive(true);
    scale.set(AVATAR_HOVER_SCALE);
    offsetY.set(-4);
    shineOpacity.set(0.65);
  }, [offsetY, scale, shineOpacity]);

  return (
    <motion.div
      className="relative rounded-[2rem]"
      style={{
        boxShadow: isActive
          ? "0 34px 68px -28px color-mix(in srgb, var(--color-primary) 42%, transparent)"
          : "0 24px 48px -30px color-mix(in srgb, var(--color-primary) 35%, transparent)",
        rotateX: smoothRotateX,
        rotateY: smoothRotateY,
        scale: smoothScale,
        transformPerspective: 900,
        y: smoothOffsetY,
      }}
      transition={{ stiffness: 300, type: "spring" }}
    >
      <div className="-inset-3 pointer-events-none absolute rounded-[2.4rem] border border-primary/18 bg-white/35" />
      <div className="-inset-1 pointer-events-none absolute rounded-[2.2rem] border border-white/80 bg-gradient-to-br from-white/80 to-transparent" />
      <Avatar
        className="relative size-40 rounded-[2rem] border border-white/80 shadow-[0_30px_70px_-36px_color-mix(in_srgb,var(--color-primary)_45%,transparent)] md:size-48"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={resetTilt}
        onPointerMove={handlePointerMove}
      >
        <AvatarImage
          alt="Manthan"
          className="rounded-[2rem]"
          src="/assets/images/me.avif"
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem] mix-blend-screen"
          style={{
            backgroundImage: shineBackground,
            opacity: smoothShineOpacity,
          }}
        />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2rem]"
          style={{
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.3), transparent 42%, rgba(99,102,241,0.14) 100%)",
            opacity: smoothShineOpacity,
          }}
        />
        <AvatarFallback className="rounded-[2rem] bg-foreground font-serif text-6xl text-background md:text-7xl">
          m
        </AvatarFallback>
      </Avatar>
    </motion.div>
  );
}
