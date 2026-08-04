import {StepTableRow} from "@app/interfaces/step-table-row";

// this class is only used on the front end by tablestepentry component.
// if it ever needs to be sent to the web service, create a DTO class and make this extend Local.
export class StepTable {
  stepTableRows: StepTableRow[] = [];
}
