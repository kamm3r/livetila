export type Competitions = Competition[]

export interface Competition {
  Id: number
  Name: string
  OrganizationName: string
  Date: string
  Stadion: Stadion
  LiveStatus: string
}

export interface Stadion {
  Name?: string
  TrackCount: number
  Type: number
}