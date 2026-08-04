import {ProcedureDetailsReportingDTO} from '@app/interfaces/procedure-details-reporting-dto';
import {UsersDTO} from '@app/interfaces/users.dto';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';

export interface ProcedureListReportingDTO extends ProcedureDetailsReportingDTO {
  formattedDate: string;
  status: ProcedureStatus;
}
