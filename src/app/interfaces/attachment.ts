import {ProcedureHeader} from '@app/interfaces/procedure-header.dto';
import {Run} from '@app/interfaces/Run';
import {StepDefDTO} from '@app/interfaces/step-def.dto.interface';
import {EditType} from '@app/interfaces/edit-type.dto';

export class Attachment {
  pk: number = null;
  filename: String = null;
  originalFilename: String = null;
  isImage: boolean = false;
  editType: EditType = EditType.ORIGINAL;
}


export class ProcedureAttachment extends Attachment {
  procedureHeader: ProcedureHeader;
}

export class RunAttachment extends Attachment {
  run: Run;
}

export class RunStepAttachment extends Attachment {
  stepDef: StepDefDTO;
}

export class StepDefAttachment extends Attachment {
  stepDef: StepDefDTO;
}
