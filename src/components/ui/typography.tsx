import { cn } from "@/lib/shadcn/utils";
import React, { forwardRef, type JSX } from "react";

// Reusable helper to create components with consistent structure
const createComponent = <T extends HTMLElement>(
  tag: keyof JSX.IntrinsicElements,
  defaultClassName: string,
  displayName: string,
) => {
  const Component = forwardRef<T, React.HTMLAttributes<T>>((props, ref) => {
    return React.createElement(
      tag,
      { ...props, ref, className: cn(defaultClassName, props.className) },
      props.children,
    );
  });
  Component.displayName = displayName;
  return Component;
};

export const H1 = createComponent<HTMLHeadingElement>(
  "h1",
  "scroll-m-20 font-serif text-5xl font-normal tracking-[-0.03em] text-balance lg:text-7xl",
  "H1",
);

export const H2 = createComponent<HTMLHeadingElement>(
  "h2",
  "scroll-m-20 border-b border-border/70 py-3 font-serif text-3xl font-normal tracking-[-0.025em] first:mt-0 lg:text-4xl",
  "H2",
);

export const H3 = createComponent<HTMLHeadingElement>(
  "h3",
  "scroll-m-20 text-2xl font-semibold tracking-[-0.03em]",
  "H3",
);

export const H4 = createComponent<HTMLHeadingElement>(
  "h4",
  "scroll-m-20 text-xl font-semibold tracking-tight",
  "H4",
);

export const Lead = createComponent<HTMLParagraphElement>(
  "p",
  "text-lg leading-8 text-muted-foreground md:text-xl",
  "Lead",
);

export const P = createComponent<HTMLParagraphElement>(
  "p",
  "leading-8 text-foreground/88 [&:not(:first-child)]:mt-6",
  "P",
);

export const Large = createComponent<HTMLDivElement>(
  "div",
  "text-lg font-semibold",
  "Large",
);

export const Small = createComponent<HTMLParagraphElement>(
  "p",
  "text-sm font-medium leading-none tracking-[-0.01em]",
  "Small",
);

export const Muted = createComponent<HTMLSpanElement>(
  "span",
  "text-sm text-muted-foreground/95",
  "Muted",
);

export const InlineCode = createComponent<HTMLSpanElement>(
  "code",
  "relative rounded-md bg-accent/75 px-[0.45rem] py-[0.22rem] font-mono text-[0.9em] font-medium text-foreground",
  "InlineCode",
);

export const MultilineCode = createComponent<HTMLPreElement>(
  "pre",
  "relative overflow-x-auto rounded-3xl border border-border/80 bg-[#fffaf1] p-5 font-mono text-sm font-medium shadow-[0_20px_40px_-36px_color-mix(in_srgb,var(--color-foreground)_32%,transparent)]",
  "MultilineCode",
);

export const List = createComponent<HTMLUListElement>(
  "ul",
  "my-6 ml-6 list-disc [&>li]:mt-2",
  "List",
);

export const Quote = createComponent<HTMLQuoteElement>(
  "blockquote",
  "mt-6 border-primary/30 border-l-2 pl-6 font-serif text-2xl italic leading-tight text-foreground/78",
  "Quote",
);
