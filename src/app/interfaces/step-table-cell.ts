import {Local, LocalProperties} from "@app/interfaces/local.class";
import {StepTableCellDTO} from "@app/interfaces/step-table-cell.dto";
import * as _ from "lodash";

export class StepTableCell extends Local<StepTableCellDTO, StepTableCell> {
  pk?: number;  // pk may be omitted when creating new StepTableCell in the UI.
  cellIndex: number;
  editable: boolean = false;
  nonEditableValue: string = '';
  optional: boolean = false;
  summerNoteEnabled: boolean = false;

  constructor(cellIndex: number, nonEditableValue: string) {
    super();
    this.cellIndex = cellIndex;
    this.nonEditableValue = nonEditableValue;
  }

  asDTO(): StepTableCellDTO {
    const dto: Required<StepTableCellDTO> = {
      pk: this.pk,
      cellIndex: this.cellIndex,
      editable: this.editable,
      nonEditableValue: this.nonEditableValue,
      optional: this.optional
    };
    return dto;
  }

  loadFromDTO(dto: StepTableCellDTO): this {
    const cell: Required<_.Omit<StepTableCell, LocalProperties>> = {
      pk: dto.pk,
      cellIndex: dto.cellIndex,
      editable: dto.editable,
      nonEditableValue: dto.nonEditableValue,
      optional: dto.optional,
      summerNoteEnabled: false
    }
    return _.merge(this, cell);
  }
}

