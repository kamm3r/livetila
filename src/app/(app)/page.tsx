import { SearchForm } from "~/@/components/search-form";

export default async function Home() {
  return (
    <>
      <main className="flex min-h-dvh flex-col items-center">
        <section className="flex flex-1 flex-col items-center justify-start px-4 py-16 sm:py-24">
          <div className="fade-in-0 slide-in-from-bottom-6 mx-auto max-w-3xl animate-in text-center duration-700">
            <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight sm:text-5xl md:text-6xl">
              Kilpailutulokset{" "}
              <span className="text-primary font-light">reaaliajassa</span>
            </h1>
            <p className="fade-in-0 slide-in-from-bottom-4 mx-auto mt-6 max-w-xl animate-in text-pretty text-lg text-muted-foreground delay-150 duration-600">
              Seuraa urheilukilpailuja livenä. Hae kilpailuja ja löydä lajit,
              joista haluat nähdä tulokset.
            </p>
          </div>

          <div className="fade-in-0 slide-in-from-bottom-4 w-full max-w-xl animate-in delay-150 duration-500">
            <SearchForm />
            <p className="mt-2 text-center text-muted-foreground text-xs">
              Vinkki: valitse kilpailu ja rajaa laji kirjoittamalla “/”
            </p>
            <p className="mt-4 text-center text-muted-foreground text-sm">
              Powered by tuloslista.com
            </p>
          </div>
        </section>
      </main>
      <footer className="border-border/50 border-t py-6 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Livetila - Kilpailutulokset striimeihin
          </p>
        </div>
      </footer>
    </>
  );
}
