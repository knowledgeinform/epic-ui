import { Users } from './users';

export class RosterMember {
  userId: number;
  name: string;
  roles: Set<string> = new Set<string>();

  constructor(user?: Users) {
    if (user) {
      this.userId = user.userId;
      this.name = user.displayName;
    }
  }
}
