export type CompetitionList = {
  id: number;
  competitionName: string;
  clubName: string;
  date: string;
  stadionName: string;
  activityStatus: boolean;
};

export type Competition = {
  id: number;
  competitionName: string;
  gender: "Men" | "Women" | "Mixed";
  competitionStatus: "final" | "semi-final" | "qualification";
  status: "official" | "unofficial"; // enum, pointless?
  event: string; // use enum in database
  participantCount: number;
  participants: Participant[];
  startingTime: string;
  endingTime: string;
};

export type Club = {
  id: number;
  name: string;
  shorthand: string;
};
export type Attempt = {
  result?: string;
  try?: "x" | "o" | "-";
};

export type Athlete = {
  firstname: string;
  lastname: string;
  club: Club;
  gender: "Men" | "Women";
  nationality: string;
  licenseId?: string;
};

export type Participant = {
  confirmed: boolean;
  athlete: Athlete;
  participationNumber: string;
  rank?: number;
  result: string;
  attempts?: Attempt[];
  wind: string;
  seuraCupPoints: number;
  notInCompetition: boolean; // no needed?
  orderNumber: number; // pointless??
};
