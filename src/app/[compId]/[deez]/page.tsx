import { InfoIcon } from "lucide-react";
import { Button } from "../../../@/components/ui/button";
import { Input } from "../../../@/components/ui/input";
import { Label } from "../../../@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../@/components/ui/popover";
import { AthleteCard } from "../../../components/athleteCard";

export default async function Page() {
  return (
    <div className="row-span-1 flex sm:col-span-2 flex-col flex-1 gap-5">
      <div className="flex justify-between ">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Laji
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <InfoIcon className="h-[1.2rem] w-[1.2rem] stroke-2 stroke-gray-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxWidth">Max. width</Label>
                  <Input
                    id="maxWidth"
                    defaultValue="300px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxHeight">Max. height</Label>
                  <Input
                    id="maxHeight"
                    defaultValue="none"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="text-gray-200 flex flex-col gap-2 overflow-y-auto p-2">
        <AthleteCard />
      </div>
    </div>
  );
}
