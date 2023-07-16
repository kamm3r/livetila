'use client';
import {
  useQuery as compsQuery,
  useQuery as compQuery,
} from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../@/components/ui/table';
import Link from 'next/link';
import { useAtom, useAtomValue } from 'jotai';
import { compIdAtom, compsAtom, filteredCompsAtom } from '../utils/store';
import { Separator } from '../@/components/ui/separator';
import { Button } from '../@/components/ui/button';
import { CompetitionList } from '../types/comp';

export function Sub() {
  const arrayname = l.find((comp) => comp.Id.toString() === compId);
  const compId = useAtomValue(compIdAtom);
  const { isLoading, error, data } = useQuery({
    queryKey: ['competitions'],
    queryFn: () =>
      fetch(
        `https://cached-public-api.tuloslista.com/live/v1/competition/${compId}`
      ).then((res) => res.json()),
  });

  const getDate = new Date(arrayname?.Date!).toLocaleString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  if (isLoading) return 'Loading...';

  if (error)
    return 'An error has occurred: ' + (error as { message: string }).message;

  return (
    <>
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {data && data[0].Name}
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Aika</TableHead>
            <TableHead>Laji</TableHead>
            <TableHead>Kierros</TableHead>
            <TableHead className="text-right">Tila</TableHead>
            <TableHead className="text-right">Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* @ts-ignore */}
          {data[getDate]?.map((e) => (
            <TableRow key={/*e.Id*/ 1}>
              <TableCell className="font-medium">
                {new Date(e.BeginDateTimeWithTZ).toLocaleString('fi-FI', {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </TableCell>
              <TableCell>e.EventName</TableCell>
              <TableCell>e.Name</TableCell>
              <TableCell className="text-right">e.Status</TableCell>
              <TableCell className="text-right text-blue-500 underline">
                <Link href={`/${compId}/${e.Id}`}>Link</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>list of events</TableCaption>
      </Table>
    </>
  );
}
export function Deez() {
  const { isLoading: compIsloading, data: dComp } = compsQuery<
    CompetitionList[]
  >({
    queryKey: ['competitions'],
    queryFn: () =>
      fetch(
        'https://cached-public-api.tuloslista.com/live/v1/competition'
      ).then((res) => res.json()),
  });

  const [, setValue] = useAtom(compsAtom);
  const [compId, setCompId] = useAtom(compIdAtom);

  const list = useAtomValue(filteredCompsAtom);
  const arrayname = dComp?.find((comp) => comp.Id === compId);
  const { isLoading, error, data } = compQuery({
    queryKey: ['competition'],
    queryFn: () =>
      fetch(
        `https://cached-public-api.tuloslista.com/live/v1/competition/${compId}`
      ).then((res) => res.json()),
  });

  const getDate = new Date(arrayname?.Date!).toLocaleString('fi-FI', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  if (compIsloading || !dComp || isLoading || !data) return 'Loading...';

  if (error)
    return 'An error has occurred: ' + (error as { message: string }).message;

  return (
    <>
      <div className="flex flex-col flex-1 basis-3/4 max-w-4xl">
        <Button onClick={() => setValue(dComp)}>deez</Button>
        {/* <Search /> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Päivämäärä</TableHead>
              <TableHead>Kilpailun nimi</TableHead>
              <TableHead>Seura</TableHead>
              <TableHead className="text-right">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((comp) => (
              <TableRow
                key={comp.Id}
                onClick={() => {
                  setCompId(comp.Id);
                  console.log('id', compId);
                }}
              >
                <TableCell className="font-medium">
                  {new Date(comp.Date).toLocaleString('fi-FI', {
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell>{comp.Name}</TableCell>
                <TableCell>{comp.OrganizationName}</TableCell>
                <TableCell className="text-right text-blue-500 underline">
                  <Link href={`/${comp.Id}`}>Link</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableCaption>list of competitions</TableCaption>
        </Table>
      </div>
      <div className="flex flex-col flex-1 basis-1/4">
        {dComp?.find((comp) => comp.Id === compId) ? (
          <>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              {arrayname?.Name}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Aika</TableHead>
                  <TableHead>Laji</TableHead>
                  <TableHead>Kierros</TableHead>
                  <TableHead className="text-right">Tila</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data[getDate]?.map((e) => (
                  <TableRow key={e.Id}>
                    <TableCell className="font-medium">
                      {new Date(e.BeginDateTimeWithTZ).toLocaleString('fi-FI', {
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{e.EventName}</TableCell>
                    <TableCell>{e.Name}</TableCell>
                    <TableCell className="text-right">{e.Status}</TableCell>
                    <TableCell className="text-right text-blue-500 underline">
                      <Link href={`/${compId}/${e.Id}`}>Link</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>list of events</TableCaption>
            </Table>
          </>
        ) : (
          <p className="text-2xl font-semibold leading-none tracking-tight">
            no select a competition
          </p>
        )}
      </div>
    </>
  );
}
