import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { first, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AppUpdateService {

  private interval;

  constructor(
    private swUpdate: SwUpdate,
    private matSnackbar: MatSnackBar,
    private applicationRef: ApplicationRef,
  ) {

    // Prevent checking while using Angular dev server, which fails.
    if (!environment.production) return;

    // Subscribe to version updates - check for VERSION_READY events
    this.swUpdate.versionUpdates.pipe(
      filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY')
    ).subscribe(e => {
      const snackbar = this.matSnackbar.open('Application Update Available!', 'Apply Update');

      snackbar.onAction()
        .subscribe(() => {
          clearInterval(this.interval);
          window.location.reload();
        });
    });

    // Check for updates every minute.
    this.applicationRef.isStable.pipe(
      first(stable => stable),
    ).subscribe((stable) => {
      this.interval = setInterval(() => {
        this.checkForUpdate();
      }, 60000);
    });

  }

  public checkForUpdate() {
    this.swUpdate.checkForUpdate();
  }

}
