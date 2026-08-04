import { Injectable } from '@angular/core';
import { EPICWSService } from './epic-ws.service';
import { ProcedureDetailsDTO } from '@app/interfaces/procedure-details.dto';
import { Router } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog'
import { ProcedureDef } from '@app/interfaces/procedure-def.dto';
import * as _ from 'lodash';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogModel
} from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';
import {ProcedureDetailsDashboard} from '@app/interfaces/procedure-details-dashboard.dto';

@Injectable({
  providedIn: 'root'
})
export class ProcedureRevisionService {

  constructor(
    private epicService: EPICWSService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private loggerService: LoggerService
  ) { }

  public checkIsLatestRevision(procedure: ProcedureDetailsDTO | ProcedureDetails | ProcedureDetailsDashboard, pDef: ProcedureDef): boolean {
    return procedure.procedureDefVersion === this.getLatestRevision(pDef).procedureDefVersion;
  }

  public checkIsLatestReleasedRevision(procedureDefVersion: number, pDef: ProcedureDef): boolean {
    const latestReleasedRevision = _.chain(pDef.procedureDetails)
      .filter(pd => pd.run === null && ProcedureStatus[pd.status] === ProcedureStatus.READY)
      .sortBy(pd => pd.procedureDefVersion)
      .last().value();
    if (!latestReleasedRevision) return false;
    return procedureDefVersion === latestReleasedRevision.procedureDefVersion;
  }

  /**
   * Gets the latest revision for a ProcedureDef.
   */
  public getLatestRevision(pDef: ProcedureDef): ProcedureDetailsDTO {

    if (!pDef) {
      this.loggerService.error('getLatestRevision() called without ProcedureDef.');
      return null;
    }

    return _.chain(pDef.procedureDetails)
      .filter(pd => pd.run === null)
      .sortBy(pd => pd.procedureDefVersion)
      .last()
      .value();

  }

  public createRevision(procedure: ProcedureDetailsDTO, pDef: ProcedureDef) {

    if (!this.checkIsLatestRevision(procedure, pDef)) {
      this.loggerService.error('Cannot create revision; not latest version. ProcedureDetailsPK:' + procedure.pk + ' ; Procedure DefPK:', pDef.pk);
      this.snackBar.open('Could not create revision because this procedure is not the latest revision.', 'OK');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      maxWidth: '400px',
      data: new ConfirmationDialogModel('Create New Revision', 'Please confirm that you wish to create a new revision ' +
          'of the procedure named ' + pDef.name + '.'),
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.snackBar.open('Creating revision. Please wait...');
        this.loggerService.info('Creating a new revision from procedure details with id ' + procedure.id);
        this.epicService.createProcedureRevision(procedure.id).then( revision => {
          if (!revision) {
            this.loggerService.error('Could not create a a new revision');
            this.snackBar.open('Could not create revision.', 'OK');
            return;
          }
          this.router.navigate(['procedure', revision.id]);
          this.snackBar.dismiss();
        });
      }
    });
  }
}
