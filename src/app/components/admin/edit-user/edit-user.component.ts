import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Users } from '@app/interfaces/users';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { EPICWSService } from '@app/services/epic-ws.service';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, OnDestroy {

  public searchUsername: string = '';
  private _user: Users;
  public users: Users[];
  @ViewChild('editForm', /* TODO: add static flag */ {}) editForm: NgForm;
  public status: String;
  private subscriptions: _.Dictionary<Subscription> = {};
  public usersFiltered: Users[] = [];

  constructor(
    private epicService: EPICWSService,
    private loggerService: LoggerService
  ) { }

  ngOnInit() {
    this.updateUsers();
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, subscription => subscription.unsubscribe());
  }

  private updateUsers() {
    if (this.subscriptions.users) this.subscriptions.users.unsubscribe();
    this.subscriptions.users = this.epicService.getAllUsers().subscribe(users => {
      this.users = users;
      this.applyUserFilter();
    });
  }

  public onSearchTextChange() {
    this.applyUserFilter();
    this.updateUsers();  // TODO: Find a better mechanism for keeping users updated.
  }

  private applyUserFilter() {

    // Filter users
    this.usersFiltered = this.searchUsername.length ? _.filter(this.users, user => _.includes(user.username, this.searchUsername)) : this.users;

    // Select user if text matches exactly.
    const exactMatches = _.filter(this.users, user => this.searchUsername === user.username);
    this.user = exactMatches.length === 1 ? exactMatches[0] : null;

  }

  public get user() {
    return this._user;
  }
  public set user(user: Users) {
    this._user = _.cloneDeep(user);
  }

  public submitEdit() {
    this.status = 'Updating...';

    this.epicService.updateUserInformation(this.user).toPromise().then((res) => {

      // If res, success!
      if (res) {
        this.status = 'Updated!';
        this.user = res;
        this.loggerService.info('Updated user information', this.user);
      } else {
        this.status = 'User could not be updated.';
        this.loggerService.error('Could not update user', this.user);
      }

    });
  }

  public cancelEdit() {
    this.applyUserFilter();
  }

  public clearSearchCriteria() {
    this.searchUsername = '';
    this.applyUserFilter();
  }

}
