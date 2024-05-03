import { type AppType } from "next/app";
import { Inter } from "next/font/google";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ThemeProvider attribute="class">
      <main className={`font-sans ${inter.variable}`}>
        <Component {...pageProps} />
      </main>
    </ThemeProvider>
  );
};

export default api.withTRPC(MyApp);
