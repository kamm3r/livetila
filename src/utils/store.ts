import { CompetitionList } from '../types/comp';
import { atom } from 'jotai';

export const inputAtom = atom<string>('');
// export const compServerAtom = atom<CompetitionList[]>([]);
export const compsAtom = atom<CompetitionList[]>([]);
export const filteredCompsAtom = atom((get) => {
  if (!inputAtom) return get(compsAtom);

  return get(compsAtom).filter((comp) =>
    comp.Name.toLowerCase().includes(inputAtom.init.toLowerCase())
  );
});
export const compIdAtom = atom<number>(13380);
