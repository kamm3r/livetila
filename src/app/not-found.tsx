import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "page not found 404",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <Link href="/" className="text-secondary-foreground underline">
        Home
      </Link>
      <div className="flex flex-col">
        <h1 className="text-9xl font-bold">404</h1>
        <h2 className="text-4xl font-bold">Page not found</h2>
      </div>
    </div>
  );
}
