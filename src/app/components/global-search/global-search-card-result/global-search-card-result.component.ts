import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {OfflineService} from '@app/services/offline.service';

@Component({
  selector: 'app-global-search-card-result',
  templateUrl: './global-search-card-result.component.html',
  styleUrls: ['./global-search-card-result.component.css']
})
export class GlobalSearchCardResultComponent implements OnInit {

  @Input() procedureDetails: ProcedureDetails;
  @Output() selection: EventEmitter<any> = new EventEmitter();

  constructor(
    public offlineService: OfflineService) { }

  ngOnInit(): void {
  }

  public selectDetails(details) {
    this.selection.emit(details);
  }

}
