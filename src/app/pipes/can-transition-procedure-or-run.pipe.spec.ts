import { CanTransitionProcedureOrRunPipe } from './can-transition-procedure-or-run.pipe';
import {LoginService} from '@app/services/login.service';
import {AppConfigService} from '@app/services/app-config-service.service';
import { HttpClient } from '@angular/common/http';

describe('CanTransitionProcedureOrRunPipe', () => {
  it('create an instance', () => {
    const pipe = new CanTransitionProcedureOrRunPipe();
    expect(pipe).toBeTruthy();
  });
});
