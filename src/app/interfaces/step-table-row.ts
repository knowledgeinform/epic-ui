import {StepTableCell} from "@app/interfaces/step-table-cell";
import {Local, LocalProperties} from "@app/interfaces/local.class";
import {StepTableRowDTO} from "@app/interfaces/step-table-row.dto";
import * as _ from "lodash";

export class StepTableRow extends Local<StepTableRowDTO, StepTableRow>{
  pk?: number;  // pk may be omitted when creating a new StepTableRow in the UI.
  rowNumber: number;
  stepTableCells: StepTableCell[];

  constructor(rowNumber: number) {
    super();
    this.rowNumber = rowNumber;
    this.stepTableCells = [];
  }

  asDTO(): StepTableRowDTO {
    const dto: Required<StepTableRowDTO> = {
      pk: this.pk,
      rowNumber: this.rowNumber,
      stepTableCells: _.map(this.stepTableCells, cell => cell.asDTO())
    }
    return dto;
  }

  loadFromDTO(dto: StepTableRowDTO): this {
    const row: Required<_.Omit<StepTableRow, LocalProperties>> = {
      pk: dto.pk,
      rowNumber: dto.rowNumber,
      stepTableCells: _.map(dto.stepTableCells, cell => new StepTableCell(cell.cellIndex, cell.nonEditableValue).loadFromDTO(cell))
    }
    return _.merge(this, row);
  }
}
