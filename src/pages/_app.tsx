import "~/styles/globals.css";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import { ThemeProvider } from "next-themes";

const MyApp: AppType = ({ Component, pageProps }) => {
    return (
        <ThemeProvider attribute="class">
            <Component {...pageProps} />
        </ThemeProvider>
    )
};

export default api.withTRPC(MyApp);
