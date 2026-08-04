import { Local, LocalProperties } from './local.class';
import { ProgramDTO } from './program.dto';
import { RosterMember } from './roster-member';
import * as _ from 'lodash';
import { ProgramRole } from './program-role';

export class Program extends Local<ProgramDTO, Program> {

  pk: number;
  name: string;
  shortName: string;
  code: string;
  roster?: RosterMember[] = [];
  requiredProgramRoles: ProgramRole[] = [];

  public loadFromDTO(dto: ProgramDTO): this {
    if (!dto) {
      console.warn('Could not create DTO from null.');
      return;
    }

    const n: Required<_.Omit<Program, LocalProperties>> = {
      code: dto.code,
      name: dto.name,
      pk: dto.pk,
      shortName: dto.shortName,
      roster: null,
      requiredProgramRoles: _.map(dto.requiredProgramRoles, roleDto => new ProgramRole().loadFromDTO(roleDto)),
    }
    _.merge(this, n);

    return this;
  }

  public asDTO(): ProgramDTO {
    return {
      code: this.code,
      name: this.name,
      pk: this.pk,
      shortName: this.shortName,
      requiredProgramRoles: _.map(this.requiredProgramRoles, role => role.asDTO()),
    }
  }

}
