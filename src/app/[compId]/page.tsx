import { Dub } from "../../components/dub";

export default async function Page({
  params: { compId },
}: {
  params: { compId: string };
}) {
  return (
    <div className="row-span-1 flex sm:col-span-2 flex-col flex-1 gap-5">
      <Dub compId={compId} />
    </div>
  );
}
