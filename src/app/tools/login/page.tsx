"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/@/components/ui/field";
import { Input } from "~/@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/@/components/ui/select";
import { api } from "~/trpc/react";
import type { CompetitionList } from "~/types/comp";

export default function LoginPage() {
  const router = useRouter();

  const [competitionId, setCompetitionId] = useState("");
  const [password, setPassword] = useState("");
  const [page, setPage] = useState(0);
  const [allCompetitions, setAllCompetitions] = useState<CompetitionList[]>([]);

  const loginMutation = api.tools.login.useMutation();
  const createEmptyMutation = api.tools.createEmpty.useMutation();
  const listQuery = api.tools.list.useQuery({ page, pageSize: 20 });

  // Append new competitions when data arrives
  useEffect(() => {
    if (listQuery.data?.competitions) {
      setAllCompetitions((prev) => [...prev, ...listQuery.data.competitions]);
    }
  }, [listQuery.data]);

  const hasMore = listQuery.data?.hasMore ?? false;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionId || password.length < 1) return;

    const ok = await loginMutation.mutateAsync({
      id: Number(competitionId),
      passwd: password,
    });

    if (ok) {
      router.push(`/tools/${competitionId}`);
    }
  };

  const handleCreateEmpty = async () => {
    await createEmptyMutation.mutateAsync();
    router.push("/tools/new");
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">Kirjautuminen kilpailuun</h1>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="w-full space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="kilpailut-valinta">
              Kirjaudu järjestelmässä olevaan kilpailuun
            </FieldLabel>
            <Select value={competitionId} onValueChange={setCompetitionId}>
              <SelectTrigger id="kilpailut-valinta">
                <SelectValue placeholder="Etsi kilpailu" />
              </SelectTrigger>
              <SelectContent>
                {allCompetitions.map((comp) => (
                  <SelectItem key={comp.Id} value={comp.Id.toString()}>
                    <div className="flex w-full items-center justify-end gap-2">
                      <span className="truncate">
                        {comp.OrganizationName} – {comp.Name}
                      </span>{" "}
                      <span className="text-muted-foreground text-sm">
                        {new Date(comp.Date).toLocaleDateString("fi-FI")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                {hasMore && (
                  <Button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    disabled={listQuery.isLoading}
                  >
                    {listQuery.isLoading ? "Ladataan..." : "Lataa lisää"}
                  </Button>
                )}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Salasana</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kilpailun salasana"
              required
            />
            <FieldDescription>
              Jos kilpailu on tuotu Kilpailukalenterista ja olet unohtanut
              salasanan, voit kirjautua kilpailuun hallintalinkin kautta.
            </FieldDescription>
          </Field>

          <Button
            type="submit"
            disabled={!competitionId || password.length < 1}
            className="w-full"
          >
            Kirjaudu kilpailuun
          </Button>
        </FieldGroup>
      </form>

      <hr />

      {/* Create Empty Competition */}
      <div className="w-full space-y-4">
        <FieldSet>
          <FieldLegend>Uusi kilpailu</FieldLegend>
          <FieldDescription>
            Voit luoda järjestelmään uuden kilpailun ilman lajeja tai tuoda
            kilpailun lajit Kilpailukalenteri.fi:stä.
          </FieldDescription>
        </FieldSet>

        <Button onClick={handleCreateEmpty} className="w-full">
          Luo uusi kilpailu
        </Button>
      </div>
    </div>
  );
}
