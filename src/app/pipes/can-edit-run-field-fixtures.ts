import { Run } from '@app/interfaces/Run';
import { RunStatus } from '@app/interfaces/run-status.dto';
import { UserAuthDTO } from '@app/interfaces/user-auth.dto';
import { Users } from '@app/interfaces/users';

export const CREATOR_USERNAME = 'creator_user';
export const OTHER_USERNAME = 'other_user';

export function buildRun(status: RunStatus): Run {
  const run = new Run();
  run.pk = 1;
  run.status = status;
  run.user = new Users();
  run.user.username = CREATOR_USERNAME;
  run.name = 'Test Run';
  return run;
}

export const creator: UserAuthDTO = {
  accessToken: '',
  displayName: 'Creator',
  pin: '',
  userName: CREATOR_USERNAME,
  admin: false,
};

export const admin: UserAuthDTO = {
  accessToken: '',
  displayName: 'Admin',
  pin: '',
  userName: OTHER_USERNAME,
  admin: true,
};

export const nonCreatorNonAdmin: UserAuthDTO = {
  accessToken: '',
  displayName: 'Other',
  pin: '',
  userName: OTHER_USERNAME,
  admin: false,
};

/**
 * Clone a run and override its status so each test gets a fresh Run instance.
 */
export function withStatus(run: Run, status: RunStatus): Run {
  const copy = new Run();
  copy.pk = run.pk;
  copy.status = status;
  copy.user = run.user;
  copy.name = run.name;
  return copy;
}
