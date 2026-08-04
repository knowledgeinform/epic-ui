import * as _ from 'lodash';
import {Local} from './local.class';
import {RunDashboardDTO} from '@app/interfaces/run-dashboard.dto';
import {RunStatus} from '@app/interfaces/run-status.dto';
import {Users} from '@app/interfaces/users';

export class RunDashboard extends Local<RunDashboardDTO, RunDashboard>{
  procedureDetailsPk: number = null;
  id: string = null;
  runNumber: number = null;
  procedureDefVersion: number = null;
  runName: String = null;
  status: RunStatus = null;
  favoriteUsers: Users[] = null;
    // Unique UI values
  status_icon: string = null;

  constructor() { super(); }

  public loadFromDTO(dto: RunDashboardDTO) {

    if (!dto) {
      console.warn('Could not create DTO from null.');
      return;
    }

    this.loadPropsFrom(dto);
    this.favoriteUsers = _.map(dto.favoriteUsers, user => new Users().loadFromDTO(user));

    this.updateOfflineAvailabilityAsync(`/Runs/Run/${this.id}`);

    return this;
  }

  public asDTO(): RunDashboardDTO {
    return _.assign({}, this, {
      favoriteUsers: _.map(this.favoriteUsers, user => user.asDTO()),
    });
  }

}
