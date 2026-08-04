import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {OfflineService} from "@app/services/offline.service";

@Component({
  selector: 'app-global-search-card-run-result',
  templateUrl: './global-search-card-run-result.component.html',
  styleUrls: ['./global-search-card-run-result.component.css']
})
export class GlobalSearchCardRunResultComponent implements OnInit {

  @Input() procedureDetails: ProcedureDetails;
  @Output() selection: EventEmitter<any> = new EventEmitter();

  constructor(public offlineService: OfflineService) { }

  ngOnInit(): void {
  }

  public selectDetails(details) {
    this.selection.emit(details);
  }
}
