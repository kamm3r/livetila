"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent } from "~/@/components/ui/card";
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
import { toast } from "~/@/components/ui/use-toast";

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

export function SearchForm() {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(busta)}>
        <CardContent className="flex flex-col gap-1">
          <FormField
            control={form.control}
            name="compId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competition id</FormLabel>
                <FormControl>
                  <Input placeholder="type comp id" {...field} required />
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
  );
}
