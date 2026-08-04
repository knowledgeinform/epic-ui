import {Component, OnInit, ViewChild} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {OfflineService} from '@app/services/offline.service';
import * as _ from 'lodash';
import { ProcApprovalDashboardDTO } from '@app/interfaces/proc-approval-dashboard.dto';

@Component({
  selector: 'app-myapprovals',
  templateUrl: './myapprovals.component.html',
  styleUrls: ['./myapprovals.component.css']
})
export class MyapprovalsComponent implements OnInit {
  fetchIsDone = false;
  fetchError: string = null;
  procedureApprovals: any = new MatTableDataSource<any>([]);
  closeoutApprovals: any = new MatTableDataSource<any>([]);
  public localStorage: Storage = window.localStorage;

  displayedColumns: string[] = ['pk', 'type', 'name', 'status'];

  @ViewChild('procPaginator', /* TODO: add static flag */ {}) procPaginator: MatPaginator;
  // @ViewChild('witPaginator') witPaginator: MatPaginator;
  @ViewChild('closPaginator', /* TODO: add static flag */ {}) closPaginator: MatPaginator;

  constructor(
    private epicService: EPICWSService,
    public offlineService: OfflineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getApprovals();
  }

  getApprovals(): void {
    this.epicService.getMyApprovals().subscribe((data) => {
      this.fetchIsDone = true;
      if (data.procedureApprovals != null) {

        this.procedureApprovals.data = data.procedureApprovals;
        this.procedureApprovals.paginator = this.procPaginator;
      }
      if (data.closeoutApprovals != null) {
        this.closeoutApprovals.data = data.closeoutApprovals;
        this.closeoutApprovals.paginator = this.closPaginator;
      }
    });
  }

  approve(row): void {
    this.router.navigate(['procedure', row.id]);
  }

  closeout(row): void {
    this.router.navigate(['run', row.id]);
  }

  setPageSizeCookieForProcedureApprovals(event: PageEvent): void {
    this.localStorage.setItem('procedureApprovalsPageSize', String(event.pageSize));
  }

  setPageSizeCookieForCloseoutApprovals(event: PageEvent): void {
    this.localStorage.setItem('closeoutApprovalsPageSize', String(event.pageSize));
  }
}

interface ProcApprovalDashboard extends ProcApprovalDashboardDTO {
  status_icon: string;
}
