import {StepTableCellDTO} from "@app/interfaces/step-table-cell.dto";

export interface StepTableRowDTO {
  pk?: number;  // pk may be omitted when creating a new StepTableRow in the UI.
  rowNumber: number;
  stepTableCells: StepTableCellDTO[];
}
