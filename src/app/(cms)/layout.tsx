import { type PropsWithChildren, Suspense } from "react";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    // biome-ignore lint/a11y/useHtmlLang: outstatic
    <html suppressHydrationWarning>
      <body id="outstatic">
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
