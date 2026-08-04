import {
  ApplicationRef,
  Component, Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {CreateprocedureDialogComponent} from '../createprocedure-dialog/createprocedure-dialog.component';
import {Title} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {filter, first} from 'rxjs/operators';
import {CloneprocedureDialogComponent} from '@app/components/procedure/cloneprocedure-dialog/cloneprocedure-dialog.component';
import {RunStartDialogComponent} from '../run/run-start-dialog/run-start-dialog.component';
import * as _ from 'lodash';
import {OfflineService} from '@app/services/offline.service';
import {MessageService} from '@app/services/message.service';
import {Subscription} from 'rxjs';
import {LoginService} from '@app/services/login.service';
import {LoggerService} from '@app/services/logger.service';
import {MatSidenav} from "@angular/material/sidenav";
import {GlobalSearchSidenavComponent} from "../global-search/global-search-sidenav/global-search-sidenav.component";
import { AppService } from '@app/services/app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  pageTitle: string;
  notLoginPage = false;
  searchText: any;

  public appIsStable = false;

  private subscriptions: { [id: string]: Subscription } = {};
  @Input() inputSideNav: MatSidenav;
  @ViewChild('globalSearchSidenav') globalSearchSidenavComponent: GlobalSearchSidenavComponent;
  @ViewChild('sidenav') matSidenav: MatSidenav;
  sidenavOpenedOnce: boolean = false;

  constructor(private router: Router,
              private titleService: Title,
              private applicationRef: ApplicationRef,
              public dialog: MatDialog,
              public offlineService: OfflineService,
              private messageService: MessageService,
              public loginService: LoginService,
              private loggerService: LoggerService, 
              private appService: AppService) {
                this.appService.pageTitleChanged.subscribe(pageTitle => {
                  this.setPageTitle(pageTitle);
                })
                this.appService.browserTitleChange.subscribe(browserTitle => {
                  this.setTitle(browserTitle);
                })
  }

  ngOnInit() {

    window.location.hash = '';
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const page = event.url.replace(/\?.+$/, '');
        this.notLoginPage = page !== '/login';
        if (event['url'] === '/profile') {
          this.setPageTitle('Welcome, ' + this.loginService.currentUser.displayName);
          this.setTitle('[Profile] - ' + this.loginService.currentUser.displayName);
        } else if (event['url'].includes('/procedure') || event['url'].includes('/run')) {
          // these are handled by the app.service
          return;
        } else {
          this.setTitle('EPIC');
          this.setPageTitle('');
        }
      });

    this.subscriptions.offlineMessage = this.offlineService.offlineSubject.subscribe(() => {
      const msg = `You have gone ${this.offlineService.offline ? 'offline' : 'online'}. ${this.offlineService.statusExplanation}`;
      this.messageService.showSnackBar(msg, 'OK', 5000);
      this.loggerService.info(msg);
    });

    this.applicationRef.isStable.pipe(
      first(stable => stable),
    ).subscribe((stable) => {
      this.appIsStable = true;
    })

  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  public setPageTitle(newTitle: string) {
    this.pageTitle = newTitle;
  }

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['login']);
  }

  openCreateProcDialog(): void {
    this.dialog.open(CreateprocedureDialogComponent, {width: '600px', disableClose: true});
  }

  openCloneProcDialog(): void {
    this.dialog.open(CloneprocedureDialogComponent, {width: '800px', disableClose: true});
  }

  openStartRunDialog(): void {
    this.dialog.open(RunStartDialogComponent, {
      width: '800px',
      disableClose: true,
      data: {
        selectedProcedureDefPk: undefined,
        searchForProcedure: true
      }
    });
  }

  /**
   * This method opens an email message from the user's email client of choice in order to send a message to
   * EPIC Support. It also flushes the logger batch buffer, sending any stored messages to the server.
   */
  emailEpicSupport(): void {
    const emailForEpicSupport = 'epic-support@jhuapl.edu';
    const subject = 'EPIC Support Request';
    const emailBody = 'Please tell us your support request here.';
    window.location.href = 'mailto:' + emailForEpicSupport + '?subject=' + subject + '&body=' + emailBody;
    this.loggerService.sendLogMessagesToServerNow();
  }

  clickSidenav(){
    if (!this.sidenavOpenedOnce){
      this.globalSearchSidenavComponent.listenToClick();
      this.sidenavOpenedOnce = true;
    }
    this.matSidenav.toggle();
  }
}
