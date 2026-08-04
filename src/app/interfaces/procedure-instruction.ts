import {Local, LocalProperties} from '@app/interfaces/local.class';
import {ProcedureInstructionDTO} from '@app/interfaces/procedure-instruction.dto';
import {EditType} from '@app/interfaces/edit-type.dto';
import {BlackLineDto} from '@app/interfaces/black-line.dto';
import {RedLineComment, RunCloseoutStickyComment} from '@app/interfaces/comment.dto';
import {ProcedureDetails} from '@app/interfaces/procedure-details';
import * as _ from 'lodash';

export class ProcedureInstruction extends Local<ProcedureInstructionDTO, ProcedureInstruction> {
  pk: number;
  sectionName: string;
  displayOrder: number;
  text: string;
  procedureDetails: ProcedureDetails;
  editType: EditType;
  blackLineComments?: BlackLineDto[];
  redLineComments?: RedLineComment[];
  runCloseoutStickyComments?: RunCloseoutStickyComment[];

  public loadFromDTO(dto: ProcedureInstructionDTO): this {
    const instruction: Required<_.Omit<ProcedureInstruction, LocalProperties>> = {
      pk: dto.pk,
      sectionName: dto.sectionName,
      displayOrder: dto.displayOrder,
      text: dto.text,
      procedureDetails: new ProcedureDetails().loadFromDTO(dto.procedureDetails),
      editType: dto.editType,
      blackLineComments: dto.blackLineComments,
      redLineComments: dto.redLineComments,
      runCloseoutStickyComments: dto.runCloseoutStickyComments
    };
    return _.merge(this, instruction);
  }

  public asDTO(): ProcedureInstructionDTO {
    const dto: Required<ProcedureInstructionDTO> = {
      pk: this.pk,
      sectionName: this.sectionName,
      displayOrder: this.displayOrder,
      text: this.text,
      procedureDetails: this.procedureDetails ? { pk: this.procedureDetails.pk } : null,
      editType: this.editType,
      blackLineComments: this.blackLineComments,
      redLineComments: this.redLineComments,
      runCloseoutStickyComments: this.runCloseoutStickyComments
    };
    return dto;
  }
}
