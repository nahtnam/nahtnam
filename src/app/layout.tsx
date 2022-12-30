import './globals.css';
import { Inter } from '@next/font/google';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import classNames from 'classnames';

const inter = Inter({
  variable: '--font-inter',
  subsets: ["latin"]
});

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={classNames(inter.variable, "h-full")}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1"  />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest"></link>
      </head>
      <body className='h-full'>
        <div className="flex flex-col h-full">
          <div>
            <Navigation />
          </div>
          <div className="grow mt-8">{children}</div>
          <div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
