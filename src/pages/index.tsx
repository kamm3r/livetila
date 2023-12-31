import Head from "next/head";
import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "../@/components/ui/card";
import { Input } from "~/@/components/ui/input";
import { Button } from "~/@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/@/components/ui/form";
import { Toaster } from "~/@/components/ui/toaster";
import { toast } from "~/@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/@/components/ui/dropdown-menu";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

const inputSchema = z.object({
  compId: z
    .string()
    .regex(new RegExp("[0-9]-[0-9]"), {
      message: "It has to look like THIS number-number",
    })
    .min(10, {
      message: "compId must be at least 10 characters.",
    })
    .max(15, {
      message: "thing again putting amount of number here.",
    }),
});

export default function Home() {
  const { setTheme } = useTheme();
  const router = useRouter();
  const form = useForm<z.infer<typeof inputSchema>>({
    resolver: zodResolver(inputSchema),

    mode: "onChange",
  });
  function busta(data: z.infer<typeof inputSchema>): void {
    console.log(data);
    void router.push(`/competition/${data.compId}`);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <>
      <Head>
        <title>Livetila</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="relative flex h-screen w-screen flex-col">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-grow flex-col p-4 sm:p-8">
            <div className="flex flex-col items-center">
              <Card>
                <CardHeader>
                  <CardTitle>Competition Overlay</CardTitle>
                  <CardDescription>
                    Get overlay for your live stream. Get competition id from
                    live.tulospalvelu.com
                  </CardDescription>
                </CardHeader>
                <Form {...form}>
                  <form
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    onSubmit={form.handleSubmit(busta)}
                  >
                    <CardContent className="flex flex-col gap-1">
                      <FormField
                        control={form.control}
                        name="compId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Competition id</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="type comp id"
                                {...field}
                                required
                              />
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                              Expected format is `number-number`
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        disabled={
                          form.formState.isValid || form.formState.isSubmitting
                            ? false
                            : true
                        }
                      >
                        Go To
                      </Button>
                    </CardContent>
                  </form>
                </Form>
                {/*  <CardFooter>
                                     <Button
                                     type="button"
                                     disabled={form.formState.isValid || form.formState.isSubmitting ? false : true}
                                     onClick={() => {
                                     form.setValue('compId', form.getValues().compId)
                                     busta(form.getValues())
                                     console.log(`deez ${form.getValues().compId}`)
                                     }}>Go To</Button>
                                     </CardFooter>*/}
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}
