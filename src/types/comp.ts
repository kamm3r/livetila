export type CompetitionProperties = {
  Settings: [];
  Competition: CompetitionDetails;
};

export type CompetitionDetails = {
  Id: number;
  Name: string;
  BeginDate: Date;
  Organization: string;
  ConfirmationDeadlineInMinutes: number;
  ConfirmationOpensWindowInDays: number;
};

export type CompetitionList = {
  Id: number;
  Name: string;
  OrganizationName: string;
  Date: string;
  Stadion: Stadion;
  LiveStatus: string;
};

export type Stadion = {
  Name?: string;
  TrackCount: number;
  Type: number;
};

export type Events = {
  [date: string]: EventList[];
};

export type EventList = {
  Id: number;
  BeginDateTimeWithTZ: string;
  Category: string;
  SubCategory: string;
  EventId: number;
  EventName: string;
  Gender: string;
  Age: string;
  Name: string;
  Status: string;
  GroupName: string;
  CountEnrolled: number;
  CountConfirmed: number;
  CountAllocated: number;
};

export type Competition = {
  Enrollments: Enrollment[];
  EventCategory: string;
  EventSubCategory: string;
  IsCombinedEvent: boolean;
  RootName: string;
  RootId: number;
  FinalResults: string;
  Diag: Diag;
  Id: number;
  EventType: EventType;
  Name: string;
  BeginDateTimeWithTZ: string;
  Group: string;
  Order: number;
  RoundCount: number;
  EnrCount: number;
  Gender: string;
  Rounds: Round[];
  SubEvents: string;
  GroupEvent: string;
  Index: number;
  CombinedEventFactors: string;
};

export type Enrollment = {
  Id: number;
  Confirmed: boolean;
  NotInCompetition: boolean;
  Ranking: string;
  Number: string;
  PB: string;
  SB: string;
  PBValue?: number;
  SBValue?: number;
  TeamId: number;
  Name: string;
  Firstname: string;
  Surname: string;
  Organization: Organization;
  Athletes: Athlete[];
};

export type Organization = {
  Name: string;
  NameShort: string;
  Id: number;
};

export type Athlete = {
  Id: number;
  Index: number;
  LicenseDbId: number;
  LicenseId?: string;
  Firstname: string;
  Surname: string;
  Gender: string;
  DOB: string;
  Organization: Organization;
  Nationality: string;
};

export type Diag = {
  TS: string;
  QC: number;
  EL: number;
};

export type EventType = {
  Id: number;
  Name: string;
  Code: string;
  SortOrder: number;
  Category: string;
  SubCategory: string;
  TeamSize: number;
  Length: number;
};

export type Round = {
  Id: number;
  RoundTypeCategory: string;
  RoundTypeId: number;
  Name: string;
  BeginDateTimeWithTZ: string;
  QRank: string;
  QResult: string;
  EventId: number;
  Heats: Heat[];
  Status: string;
  GroupResultsSummary: string;
  Index: number;
  TotalResults: TotalResult[];
};

export type Heat = {
  Id: number;
  Index: number;
  Wind: string;
  Allocations: Allocation[];
};

export type Allocation = {
  NotInCompetition: boolean;
  Id: number;
  AllocId: number;
  Position: number;
  Number: string;
  QRank: boolean;
  QResult: boolean;
  ResultRank?: number;
  HeatRank?: number;
  ReverseOrderRank: string[];
  Result: string;
  CEPoints: number;
  SeuraCUPPoints: number;
  Wind: string;
  AthleteOrders: string[];
  Attempts: Attempt[];
  TeamName: string;
  Marks: string[];
  Results: string;
  NoWAResult: string;
  NoWAWind: string;
  PB: string;
  SB: string;
  TeamId: number;
  Name: string;
  Firstname: string;
  Surname: string;
  Organization: Organization;
  Athletes: Athlete[];
};

export type Attempt = {
  Line1: string;
  Line2: string;
};

export type TotalResult = {
  NotInCompetition: boolean;
  Id: number;
  AllocId: number;
  Position: number;
  Number: string;
  QRank: boolean;
  QResult: boolean;
  ResultRank?: number;
  HeatRank?: number;
  ReverseOrderRank: string[];
  Result: string;
  CEPoints: number;
  SeuraCUPPoints: number;
  Wind: string;
  AthleteOrders: string[];
  Attempts: Attempt[];
  TeamName: string;
  Marks: string[];
  Results: string;
  NoWAResult: string;
  NoWAWind: string;
  PB: string;
  SB: string;
  TeamId: number;
  Name: string;
  Firstname: string;
  Surname: string;
  Organization: Organization;
  Athletes: Athlete[];
};
