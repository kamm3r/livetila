import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CommandInput } from "~/@/components/ui/command";
import { type CompetitionList } from "~/types/comp";

export function SearchComps({
  selectedComp,
}: {
  selectedComp: CompetitionList | null;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }
  return (
    <CommandInput
      placeholder={
        selectedComp
          ? `Haetaan lajeja tulokseen ${selectedComp.Name}`
          : "Haetaan kilpailuja..."
      }
      onValueChange={handleSearch}
      defaultValue={searchParams.get("query")?.toString()}
      autoFocus={selectedComp ? true : false}
    />
  );
}
