import type { Metadata } from 'next';
import { baseUrl } from '@/config/app';
import { Footer } from './_components/footer';
import { Navigation } from './_components/navigation';

export const metadata: Metadata = {
  title: '@nahtnam - Manthan Mallikarjun',
  description:
    'Hello! I’m Manthan You can find me online @nahtnam. This is my portfolio where you can read about me and my thoughts.',
  metadataBase: new URL(baseUrl),
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full flex-col">
      <Navigation session={null} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
