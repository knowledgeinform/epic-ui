import {ProcedureDetailsDTO} from '@app/interfaces/procedure-details.dto';
import { Local } from './local.class';
import { UsersDTO } from './users.dto';
import * as _ from 'lodash';
import { environment } from '../../environments/environment';

export class Users extends Local<UsersDTO, Users> {

  userId: number = null;
  username: string = null;
  displayName: string = null;
  lastLogin: Date = null;
  pin: string = null;
  procedureDetails: ProcedureDetailsDTO[] = null;
  email?: string = null;
  isAdmin: boolean = null;

  public loadFromDTO(dto: UsersDTO): this {

    if (!dto) {
      if (!environment.production) {
        console.warn('DTO not provided to load from.');
      }
      return;
    }

    super.loadPropsFrom(dto);
    if (dto.lastLogin) this.lastLogin = new Date(dto.lastLogin);
    return this;
  }

  public asDTO(): UsersDTO {
    const dto: UsersDTO = _.assign({}, this, {
      lastLogin: this.lastLogin ? this.lastLogin.getTime() : null,
    });
    delete dto['availableOffline'];
    return dto;
  }

}
