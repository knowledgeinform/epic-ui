export interface UserAuthDTO {
  accessToken: string;
  displayName: string;
  pin: string;  // A string of numerals, exclusively.
  userName: string;
  admin: boolean;
}
