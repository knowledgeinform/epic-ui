import {Component, OnInit, ViewChild} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {TooltipPosition} from '@angular/material/tooltip';
import {Router} from '@angular/router';
import {OfflineService} from '@app/services/offline.service';
import {RunDashboard} from '@app/interfaces/RunDashboard';
import {RunStatus} from '@app/interfaces/run-status.dto';

@Component({
  selector: 'app-myruns',
  templateUrl: './myruns.component.html',
  styleUrls: ['./myruns.component.css']
})
export class MyrunsComponent implements OnInit {
  fetchIsDone = false;
  fetchError: string = null;
  runs = new MatTableDataSource<RunDashboard>([]);
  displayedColumns: string[] = ['favBtn', 'pk', 'runNumber', 'version', 'name', 'status', 'offlineStatus'];
  public RunStatus = RunStatus;
  public localStorage: Storage = window.localStorage;

  // for tooltip position
  positionOptions: TooltipPosition[] = ['after', 'before', 'left', 'right'];
  position = this.positionOptions[3];

  @ViewChild('runsPaginator', /* TODO: add static flag */ {}) runsPaginator: MatPaginator;

  constructor(
    private epicService: EPICWSService,
    private offlineService: OfflineService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getRuns();
  }

  openRun(row: RunDashboard): void {
    if (!this.runAvailable(row)) return;
    this.router.navigate(['run', row.id]);
  }

  getRuns(): void {
    this.epicService.getMyRuns().subscribe((data) => {

      this.runs.data = data;
      this.runs.paginator = this.runsPaginator;
      this.fetchIsDone = true;

    });
  }

  public runAvailable(run: RunDashboard) {
    return !this.offlineService.offline || run.availableOffline;
  }

  setPageSizeCookie(event: PageEvent): void {
    this.localStorage.setItem('runsPageSize', String(event.pageSize));
  }
}
