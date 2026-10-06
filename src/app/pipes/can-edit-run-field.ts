import { Run } from '@app/interfaces/Run';
import { UserAuthDTO } from '@app/interfaces/user-auth.dto';

/**
 * Shared editability check for run metadata fields (name, description).
 *
 * Rules (mirroring backend RunEditabilityValidator):
 * - RUNNING: Creator or Admin
 * - CORRECTING: Creator or Admin
 * - IN CLOSEOUT (REVIEWING): Admin only
 * - APPROVED / COMPLETED / ABANDONED: None
 *
 * Pre-checks (gates before status evaluation):
 * - run must exist and have a status
 * - user must exist
 * - readOnly must be false
 * - offline must be false
 */
export function canEditRunField(
  run: Run,
  user: UserAuthDTO,
  readOnly: boolean,
  offline: boolean
): boolean {
  if (!run || !run.status || !user || readOnly || offline) {
    return false;
  }

  // RUNNING and CORRECTING: creator or admin
  if (run.status === 'RUNNING' || run.status === 'CORRECTING') {
    const isCreator = run.user?.username === user.userName;
    const isAdmin = user.admin;
    return isCreator || isAdmin;
  }

  // APPROVED, COMPLETED, ABANDONED: nobody
  return false;
}
