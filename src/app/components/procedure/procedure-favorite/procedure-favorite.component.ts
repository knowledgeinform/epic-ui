import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { UsersDTO } from '@app/interfaces/users.dto';
import {EPICWSService} from '@app/services/epic-ws.service';
import {LoginService} from '@app/services/login.service';
import { OfflineService } from '@app/services/offline.service';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-procedure-favorite',
  templateUrl: './procedure-favorite.component.html',
  styleUrls: ['./procedure-favorite.component.css']
})
export class ProcedureFavoriteComponent implements OnInit {


  @Input() isReadOnly: boolean = false;
  @Input() procedureDetailsId: number;
  @Input() userFavoriteList: UsersDTO[];
  @Output() userFavoriteListChange = new EventEmitter();
  @Input() showFavText = true;
  public disabled: boolean = false;
  constructor(private loginService: LoginService,
              public offlineService: OfflineService,
              private epicService: EPICWSService,
              private loggerService: LoggerService) { }

  ngOnInit() {
  }


  get isFavorite() {
    if (!this.userFavoriteList) return false;
    return this.userFavoriteList.some(e => e.username === this.loginService.currentUser.userName);
  }

  toggleFavorite() {
    this.disabled = true;
    this.loggerService.info('Setting procedure with id ' + this.procedureDetailsId + ' as ' + (this.isFavorite ? ' not favorited' : ' favorited'));
    this.epicService.toggleProcedureFavorite(this.procedureDetailsId, !this.isFavorite).subscribe((data) => {
      if (data && !data.error) {
        if (this.isFavorite) {
          this.userFavoriteList = this.userFavoriteList.filter(e => e.username !== this.loginService.currentUser.userName);
        } else {
          this.userFavoriteList.push(data);
        }
        this.userFavoriteListChange.emit(this.userFavoriteList);
      }
      this.disabled = false;
    });
  }
}
