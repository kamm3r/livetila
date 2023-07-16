import Link from "next/link";
import "./globals.css";
import { Providers, RQProviders } from "./providers";
import { ThemeSwitcher } from "../components/themeSwitch";
// import { Search } from '../components/search';

export const metadata = {
  title: "Livetila",
  description: "Live track and field sport results",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative flex h-screen w-screen flex-col justify-between">
        <RQProviders>
          <Providers>
            <div className="flex min-h-0 flex-1 flex-col">
              <header className="flex items-center justify-between px-4 pb-2 pt-4 sm:px-8 sm:py-4">
                <Link
                  href="/"
                  className="relative whitespace-nowrap text-2xl font-bold"
                >
                  Livetila{" "}
                  <sup className="absolute left-[calc(100%+.25rem)] top-0 text-xs font-extrabold text-gray-400">
                    [BETA]
                  </sup>
                </Link>
                {/* <div className="w-full max-w-md">
                  <Search />
                </div> */}
                <ThemeSwitcher />
              </header>
              <main className="flex flex-col flex-grow p-4 sm:p-8">
                {children}
              </main>
            </div>
          </Providers>
        </RQProviders>
      </body>
    </html>
  );
}
