export interface StepTableCellDTO {
  pk?: number;  // pk may be omitted when creating new StepTableCell in the UI.
  cellIndex: number;
  editable: boolean;
  nonEditableValue: string;
  optional: boolean;
}
