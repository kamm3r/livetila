import { Input } from "../@/components/ui/input";

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        Type the Competition id from url
      </h3>
      <Input className="max-w-xs" placeholder="type comp id" />
    </div>
  );
}
