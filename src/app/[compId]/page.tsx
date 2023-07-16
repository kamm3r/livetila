import { AthleteCard } from "../../components/athleteCard";

export default async function Page() {
  return (
    <div className="row-span-1 flex sm:col-span-2 flex-col flex-1 gap-5">
      <AthleteCard />
    </div>
  );
}
