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

const inputSchema = z.object({
  compId: z
    .string()
    .regex(new RegExp("[0-9]-[0-9]"), {
      message: "Sen pitää näyttää tältä 1234-567890",
    })
    .min(10, {
      message: "kilpailu id pitää olla minimissä 10 karakteria",
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
  function busta(value: z.infer<typeof inputSchema>): void {
    void router.push(`/competition/${value.compId}`);
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
                <FormLabel>Kilpailu id</FormLabel>
                <FormControl>
                  <Input placeholder="type comp id" {...field} required />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Odotettu formaatti `1234-567890`
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
            Menee kilpailuun
          </Button>
        </CardContent>
      </form>
    </Form>
  );
}
