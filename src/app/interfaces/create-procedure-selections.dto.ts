import { ProgramDTO } from './program.dto';
import { Subsystem } from './subsystem.dto';
import { TestingPhase } from './testing-phase.dto';

export interface CreateProcedureSelectionsDTO {
    programs: ProgramDTO[];
    subsystems: Subsystem[];
    testingPhases: TestingPhase[];
}
