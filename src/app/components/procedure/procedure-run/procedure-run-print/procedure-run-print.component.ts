import { Component, OnInit, OnDestroy } from '@angular/core';
import { Run } from '@app/interfaces/Run';
import { Router, ActivatedRoute } from '@angular/router';
import { EPICWSService } from '@app/services/epic-ws.service';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import {ApprovalType} from '@app/interfaces/approval';
import { ExportService } from '@app/services/export.service';
import { ProcedureDetails } from '@app/interfaces/procedure-details';
import {AttachmentType} from '@app/interfaces/attachment-type.enum';

@Component({
  selector: 'app-procedure-run-print',
  templateUrl: './procedure-run-print.component.html',
  styleUrls: ['./procedure-run-print.component.css']
})
export class ProcedureRunPrintComponent implements OnInit, OnDestroy {

  public now: Date;
  public itemType: 'run' | 'procedure';
  public run: Run;
  public procedureDetails: ProcedureDetails;
  public originalProcedureDetails: ProcedureDetails;
  private subscriptions: {[name: string]: Subscription} = {};
  public ApprovalType = ApprovalType;
  public AttachmentType = AttachmentType;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    public epicService: EPICWSService,
    public exportService: ExportService,
  ) {
      this.now = new Date();
  }

  ngOnInit() {
    this.subscriptions.route = this.route.params.subscribe(params => {

      this.itemType = params.itemType;
      if (this.itemType === 'run') {
        this.epicService.getRun(params.id).subscribe(run => {
          if (!run) return;
          this.run = run;
          this.procedureDetails = run.procedureDetails;
          this.originalProcedureDetails = run.procedureDetails.originalProcedureDetails;
        });
      } else {
        this.epicService.getProcedureDetailsByUniqueCode(params.id).subscribe( pd => {
          this.procedureDetails = pd;
          this.originalProcedureDetails = this.procedureDetails;
        });
      }
    });
  }

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  public printPage() {
    window.print();
  }

  public downloadAllAttachments() {
    this.exportService.downloadProcedureAttachments(this.procedureDetails.id);
  }

}
