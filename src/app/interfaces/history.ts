import {Users} from '@app/interfaces/users';
import {StepDef} from '@app/interfaces/step-def.interface';
import {ProcedureDetails} from '@app/interfaces/procedure-details';

export class History {
  pk: number;
  timestamp: Date;
  description: String;
  user: Users;
  stepDef: StepDef;
  procedureDetails: ProcedureDetails;
}
