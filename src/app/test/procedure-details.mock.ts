import * as _ from 'lodash';
import { procedureDetailsDTODraft1Mock, procedureDetailsDTODraft2Mock, procedureDetailsDTOInReviewMock, procedureDetailsDTOLockedRunMock} from './procedure-details-dto.mock';
import { ProcedureDetails } from '@app/interfaces/procedure-details';

export const procedureDetailsLockedRunMock: ProcedureDetails = new ProcedureDetails().loadFromDTO(procedureDetailsDTOLockedRunMock);

export const procedureDetailsDraft1Mock: ProcedureDetails = new ProcedureDetails().loadFromDTO(procedureDetailsDTODraft1Mock);

export const procedureDetailsDraft2Mock: ProcedureDetails = new ProcedureDetails().loadFromDTO(procedureDetailsDTODraft2Mock);

export const procedureDetailsInReviewMock: ProcedureDetails = new ProcedureDetails().loadFromDTO(procedureDetailsDTOInReviewMock);
