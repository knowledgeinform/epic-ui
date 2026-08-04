import { Component, OnInit } from '@angular/core';
import {ExportService} from "@app/services/export.service";
import {ActivatedRoute} from "@angular/router";
import {OfflineService} from "@app/services/offline.service";

@Component({
  selector: 'app-program-export-download',
  templateUrl: './program-export-download.component.html',
  styleUrls: ['./program-export-download.component.css']
})
export class ProgramExportDownloadComponent implements OnInit {

  fetchIsDone: boolean = false;
  constructor(private exportService: ExportService,
              protected route: ActivatedRoute,
              public offlineService: OfflineService
              ) { }

  ngOnInit(): void {
    if (!this.offlineService.offline) {
      const programExportId = this.route.snapshot.paramMap.get('programExportId');
      this.exportService.handleServerCallForExport('Export/download/' + programExportId,
        '', '', true, programExportId);
    }
    this.fetchIsDone = true;
  }

}
