import { CanEditRunDescriptionPipe } from './can-edit-run-description.pipe';
import { Run } from '@app/interfaces/Run';
import { RunStatus } from '@app/interfaces/run-status.dto';
import { CREATOR_USERNAME, OTHER_USERNAME, admin, buildRun, creator, nonCreatorNonAdmin, withStatus } from './can-edit-run-field-fixtures';

/* ------------------------------------------------------------------ */
/*  Tests                                                             */
/* ------------------------------------------------------------------ */

describe('CanEditRunDescriptionPipe', () => {
  let pipe: CanEditRunDescriptionPipe;

  beforeEach(() => {
    pipe = new CanEditRunDescriptionPipe();
  });



  /* ---- 1. Pre-checks ---- */

  describe('pre-checks', () => {
    it('should return false when run is null', () => {
      const result = pipe.transform(null, creator, false, false);
      expect(result).toBeFalse();
    });

    it('should return false when run.status is null', () => {
      const run = new Run();
      run.pk   = 1;
      run.name = 'Test Run';
      run.status = null;
      const result = pipe.transform(run, creator, false, false);
      expect(result).toBeFalse();
    });

    it('should return false when user is null', () => {
      const result = pipe.transform(buildRun(RunStatus.RUNNING), null, false, false);
      expect(result).toBeFalse();
    });

    it('should return false when readOnly is true', () => {
      const result = pipe.transform(buildRun(RunStatus.RUNNING), creator, true, false);
      expect(result).toBeFalse();
    });

    it('should return false when offline is true', () => {
      const result = pipe.transform(buildRun(RunStatus.RUNNING), creator, false, true);
      expect(result).toBeFalse();
    });
  });

  /* ---- 2. RUNNING status ---- */

  describe('RUNNING status', () => {
    it('should return true for the creator', () => {
      const result = pipe.transform(buildRun(RunStatus.RUNNING), creator, false, false);
      expect(result).toBeTrue();
    });

    it('should return true for an admin', () => {
      const result = pipe.transform(buildRun(RunStatus.RUNNING), admin, false, false);
      expect(result).toBeTrue();
    });

    it('should return false for a non-creator, non-admin user', () => {
      const result = pipe.transform(buildRun(RunStatus.RUNNING), nonCreatorNonAdmin, false, false);
      expect(result).toBeFalse();
    });
  });

  /* ---- 3. REVIEWING (IN CLOSEOUT) status ---- */

  describe('REVIEWING (IN CLOSEOUT) status', () => {
    it('should return false for an admin', () => {
      const result = pipe.transform(buildRun(RunStatus.REVIEWING), admin, false, false);
      expect(result).toBeFalse();
    });

    it('should return false for the creator (non-admin)', () => {
      const result = pipe.transform(buildRun(RunStatus.REVIEWING), creator, false, false);
      expect(result).toBeFalse();
    });

    it('should return false for a non-creator, non-admin user', () => {
      const result = pipe.transform(buildRun(RunStatus.REVIEWING), nonCreatorNonAdmin, false, false);
      expect(result).toBeFalse();
    });
  });

  /* ---- 4. CORRECTING status ---- */

  describe('CORRECTING status', () => {
    it('should return true for the creator', () => {
      const result = pipe.transform(buildRun(RunStatus.CORRECTING), creator, false, false);
      expect(result).toBeTrue();
    });

    it('should return true for an admin', () => {
      const result = pipe.transform(buildRun(RunStatus.CORRECTING), admin, false, false);
      expect(result).toBeTrue();
    });

    it('should return false for a non-creator, non-admin user', () => {
      const result = pipe.transform(buildRun(RunStatus.CORRECTING), nonCreatorNonAdmin, false, false);
      expect(result).toBeFalse();
    });
  });

  /* ---- 5. APPROVED status ---- */

  describe('APPROVED status', () => {
    it('should return false for the creator', () => {
      const result = pipe.transform(buildRun(RunStatus.APPROVED), creator, false, false);
      expect(result).toBeFalse();
    });

    it('should return false for an admin', () => {
      const result = pipe.transform(buildRun(RunStatus.APPROVED), admin, false, false);
      expect(result).toBeFalse();
    });
  });

  /* ---- 6. COMPLETED status ---- */

  describe('COMPLETED status', () => {
    it('should return false for the creator', () => {
      const result = pipe.transform(buildRun(RunStatus.COMPLETED), creator, false, false);
      expect(result).toBeFalse();
    });

    it('should return false for an admin', () => {
      const result = pipe.transform(buildRun(RunStatus.COMPLETED), admin, false, false);
      expect(result).toBeFalse();
    });
  });

  /* ---- 7. ABANDONED status ---- */

  describe('ABANDONED status', () => {
    it('should return false for the creator', () => {
      const result = pipe.transform(buildRun(RunStatus.ABANDONED), creator, false, false);
      expect(result).toBeFalse();
    });

    it('should return false for an admin', () => {
      const result = pipe.transform(buildRun(RunStatus.ABANDONED), admin, false, false);
      expect(result).toBeFalse();
    });
  });
});
