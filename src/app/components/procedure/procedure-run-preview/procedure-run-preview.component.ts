import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatTabGroup} from '@angular/material/tabs';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MessageService} from '@app/services/message.service';
import {ErrorDialogComponent} from '@app/components/error-dialog/error-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Run} from '@app/interfaces/Run';
import {RunStatus} from '@app/interfaces/run-status.dto';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {LoggerService} from '@app/services/logger.service';

@Component({
  selector: 'app-procedure-run-preview',
  templateUrl: './procedure-run-preview.component.html',
  styleUrls: ['./procedure-run-preview.component.css']
})
export class ProcedureRunPreviewComponent implements OnInit {
  @ViewChild('matTabGroup', /* TODO: add static flag */ {}) tabGroup: MatTabGroup;
  public fetchIsDone = false;
  protected fetchError: string = null;

  procId: string;
  public procedureData: ProcedureDetails;
  public run: Run = new Run();

  constructor(protected router: Router,
              private dialog: MatDialog,
              protected route: ActivatedRoute,
              public epicService: EPICWSService,
              public messageService: MessageService,
              private loggerService: LoggerService) {
  }

  ngOnInit() {

    const routeSub = this.route.params.subscribe(params => {

      // Only load data if the specified run has not been loaded yet.
      this.loadPageData(params);

    });
  }

  protected loadPageData(params: Params) {
    const procId = params?.id;
     if (procId === undefined || procId === null) {
      this.loggerService.error('No procedure ID found in route parameters.');
      return;
    }
    this.procId = params.id;
    this.run.pk = -1;
    this.run.status = RunStatus.RUNNING;
    this.run.name = 'RUN PREVIEW ONLY FOR PROCEDURE ' + this.procId;
    this.loggerService.info('Retrieving procedure with procedure id ' + this.procId + ' to display in run preview');

    // Get runs:
    this.epicService.getProcedureDetailsByUniqueCode(this.procId).subscribe(data => {
      this.fetchIsDone = true;
      if (data.error) {
        this.loggerService.error('Could not retrieve procedure with id ' + this.procId + ' to display in run preview; ' + data.error);
        this.fetchError = data.error;
        this.dialog.open(ErrorDialogComponent, {
          data: {
            description: 'Error retrieving procedure from the server',
            errorMessage: this.fetchError,
          },
        });
      } else {
        this.procedureData = data;
      }
    });


  }

}
