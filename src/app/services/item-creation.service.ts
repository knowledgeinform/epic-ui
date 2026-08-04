import { Injectable } from '@angular/core';
import { ProgramDTO } from '@app/interfaces/program.dto';
import { EPICWSService } from './epic-ws.service';
import { Users } from '@app/interfaces/users';
import { Subsystem } from '@app/interfaces/subsystem.dto';
import { TestingPhase } from '@app/interfaces/testing-phase.dto';

@Injectable({
  providedIn: 'root'
})
export class ItemCreationService {

  constructor(
    private epicService: EPICWSService,
  ) { }

  public createProgram(prog: ProgramDTO): Promise<ProgramDTO> {
    return this.epicService.httpPost<ProgramDTO>('programs/create', prog);
  }

  public createUser(user: Users): Promise<Users> {
    return this.epicService.httpPost<Users>('AllUsers/create', user);
  }

  public createSubsystem(subsystem: Subsystem): Promise<Users> {
    return this.epicService.httpPost<Users>('subsystems/create', subsystem);
  }

  public createTestingPhase(tp: TestingPhase): Promise<TestingPhase> {
    return this.epicService.httpPost<TestingPhase>('testingPhases/create', tp);
  }

}
