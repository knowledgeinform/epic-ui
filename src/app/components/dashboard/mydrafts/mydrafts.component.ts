import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {TooltipPosition} from '@angular/material/tooltip';
import {RunStartDialogComponent} from '../../run/run-start-dialog/run-start-dialog.component';
import {OfflineService} from '@app/services/offline.service';
import {ProcedureDetailsDashboard} from '@app/interfaces/procedure-details-dashboard.dto';
import {ProcedureStatus} from '@app/interfaces/procedure-status.dto';

@Component({
  selector: 'app-mydrafts',
  templateUrl: './mydrafts.component.html',
  styleUrls: ['./mydrafts.component.css']
})
export class MydraftsComponent implements OnInit {
  fetchIsDone = false;
  fetchError: string = null;
  drafts = new MatTableDataSource<ProcedureDetailsDashboard>([]);
  displayedColumns: string[] = ['favBtn', 'procedureId', 'version', 'name', 'status', 'runStartBtn'];
  public ProcedureStatus = ProcedureStatus;
  public localStorage: Storage = window.localStorage;

  // for tooltip position
  positionOptions: TooltipPosition[] = ['after', 'before', 'left', 'right'];
  position = this.positionOptions[3];

  @ViewChild('draftsPaginator', /* TODO: add static flag */ {}) draftsPaginator: MatPaginator;

  constructor(
    private router: Router,
    private epicService: EPICWSService,
    private dialog: MatDialog,
    public offlineService: OfflineService,
  ) {
  }

  ngOnInit() {
    this.getDrafts();
  }

  getDrafts(): void {
    this.epicService.getMyDrafts().subscribe((data) => {
      this.fetchIsDone = true;
      this.drafts.data = data;
      this.drafts.paginator = this.draftsPaginator;
    });

  }

  author(row): void {
    if (!this.available()) return;
    this.router.navigate(['procedure', row.id]);
  }

  openRunStart(procedureDetailsPk: number): void {
    this.dialog.open(RunStartDialogComponent, {
      width: '800px',
      disableClose: true,
      data: {
        selectedProcedureDetailsPk: procedureDetailsPk,
        searchForProcedure: false
      }
    });
  }

  public available() {
    return !this.offlineService.offline;
  }

  setPageSizeCookie(event: PageEvent): void {
    this.localStorage.setItem('draftPageSize', String(event.pageSize));
  }
}
