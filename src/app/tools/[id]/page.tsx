"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
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

interface CompetitionPageProps {
  params: Promise<{ id: string }>;
}

export default function CompetitionPage({ params }: CompetitionPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const competitionQuery = api.tools.getCompetition.useQuery({
    id: Number(id),
  });
  const setPasswordMutation = api.tools.setPassword.useMutation();
  const saveDataMutation = api.tools.saveData.useMutation();

  const [password, setPassword] = useState("");
  const [competition, setCompetition] = useState(competitionQuery.data);

  const passNotSet = competitionQuery.data?.passnotset ?? true;
  const liveURL = `https://live.tuloslista.com/${id}`;

  async function handleSetPassword() {
    if (password.length < 4) return;

    await setPasswordMutation.mutateAsync({
      id: Number(id),
      pass: password,
    });

    await competitionQuery.refetch();
  }

  async function handleSave() {
    if (!competition) return;

    await saveDataMutation.mutateAsync({
      competition,
    });
  }

  async function toggleLiveStatus() {
    if (competition.LiveStatus === "ActiveListed") {
      competition.LiveStatus = "Disabled";
    } else {
      competition.LiveStatus = "ActiveListed";
    }
  }

  if (competitionQuery.isLoading) {
    return <div className="p-6">Ladataan...</div>;
  }

  if (!competition) {
    return <div className="p-6">Kilpailua ei löytynyt</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-3xl font-bold">Kilpailun tiedot</h1>

      {passNotSet ? (
        <div className="space-y-6">
          <FieldSet>
            <FieldLegend>Tulospalvelun salasanan asetus</FieldLegend>
            <FieldDescription>
              Tälle kilpailulle <strong>ei ole</strong> asetettu salasanaa.
              Aseta kilpailun salasana <strong>mahdollisimman pian</strong>. Jos
              kilpailulle ei ole asetettu salasanaa, kilpailun avaus myöhemmin{" "}
              <strong>ei enää onnistu</strong>.
            </FieldDescription>

            <Field>
              <FieldLabel htmlFor="password">Uusi salasana</FieldLabel>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vähintään 4 merkkiä"
              />
            </Field>

            <Button onClick={handleSetPassword} disabled={password.length < 4}>
              Aseta salasana
            </Button>
          </FieldSet>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Competition Details */}
          <FieldSet>
            <FieldLegend>Kilpailun tiedot</FieldLegend>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nimi</FieldLabel>
                <Input
                  id="name"
                  value={competition.Name}
                  onChange={(e) =>
                    setCompetition({ ...competition, Name: e.target.value })
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="org">Seura</FieldLabel>
                <Input
                  id="org"
                  value={competition.OrganizationName}
                  onChange={(e) =>
                    setCompetition({
                      ...competition,
                      OrganizationName: e.target.value,
                    })
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="date">Päivämäärä</FieldLabel>
                <Input
                  id="date"
                  type="date"
                  value={new Date(competition.Date).toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCompetition({ ...competition, Date: e.target.value })
                  }
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* Venue Details */}
          <FieldSet>
            <FieldLegend>Kilpailupaikan tiedot</FieldLegend>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="stadion">Kilpailupaikan nimi</FieldLabel>
                <Input
                  id="stadion"
                  value={competition.Stadion?.Name ?? ""}
                  onChange={(e) =>
                    setCompetition({
                      ...competition,
                      Stadion: {
                        ...competition.Stadion,
                        Name: e.target.value,
                      },
                    })
                  }
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="type">Kilpailupaikan tyyppi</FieldLabel>
                <Select
                  value={competition.Stadion?.Type?.toString() ?? "0"}
                  onValueChange={(val) =>
                    setCompetition({
                      ...competition,
                      Stadion: {
                        ...competition.Stadion,
                        Type: Number(val),
                      },
                    })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Ulkostadion</SelectItem>
                    <SelectItem value="2">Halli</SelectItem>
                    <SelectItem value="3">Muu</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </FieldSet>

          {/* Live Service */}
          <FieldSet>
            <FieldLegend>Live-tulospalvelu</FieldLegend>

            <FieldGroup>
              <Field>
                <FieldLabel>Kilpailun Live-osoite</FieldLabel>
                <Input value={liveURL} readOnly />
              </Field>

              <Field>
                <FieldLabel>Live-tulospalvelun tila</FieldLabel>
                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    {competition.LiveStatus === "ActiveListed"
                      ? "Päällä"
                      : "Pois päältä"}
                  </span>
                  <Button onClick={toggleLiveStatus} variant="outline">
                    Vaihda Liven tila
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>

          <Button onClick={handleSave} size="lg">
            Tallenna muutokset
          </Button>
        </div>
      )}
    </div>
  );
}
