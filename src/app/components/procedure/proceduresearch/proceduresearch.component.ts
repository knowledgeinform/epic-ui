import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {EPICWSService} from '@app/services/epic-ws.service';
import {debounceTime} from 'rxjs/operators';
import {MessageService} from '@app/services/message.service';
import {MatDialog} from '@angular/material/dialog';
import {ErrorDialogComponent} from '../../error-dialog/error-dialog.component';
import { OfflineService } from '@app/services/offline.service';
import {LoggerService} from '@app/services/logger.service';
import {SearchService} from "@app/services/search.service";
import {Utils} from "@app/utils";
import {ProcedureDetails} from "@app/interfaces/procedure-details";

@Component({
  selector: 'app-proceduresearch',
  templateUrl: './proceduresearch.component.html',
  styleUrls: ['./proceduresearch.component.css']
})
export class ProceduresearchComponent implements OnInit {

  results: any;
  data: any;
  programSelection: number;
  subsystemSelection: number;
  testingPhaseSelection: number;
  editTypeSelection: string;
  @Input() searchText: any [];
  private subject: Subject<string> = new Subject<string>();
  @Input() searchStatusType: string;
  @Input() isGlobalSearch: boolean;
  @Output() resultSelection: EventEmitter<any> = new EventEmitter();
  loadingResults: boolean = false;
  loadingFilterData: boolean = false;
  startSearchSubject: Subject<void> = new Subject<void>();
  searchLimit: number = Utils.getSearchLimit();
  searchOffset: number = 0;
  numberOfResults: number;
  @Input() resultSelectionSearch: ProcedureDetails;
  @Input() searchForLatestRevisions: boolean = false;
  firstSearch: boolean = true;
  selector: string = '.search-dialog-container';


  constructor(
    public epicService: EPICWSService,
    public offlineService: OfflineService,
    public messageService: MessageService,
    public errorDialog: MatDialog,
    public loggerService: LoggerService,
    public searchService: SearchService) { }

  ngOnInit() {
    // on initiation, get program and subsystem data to populate the drop-down filters
    this.loadingFilterData = true;
    this.loggerService.info('Retrieving program/subsystem/testing phase options');
    // TODO: Error handling
    this.epicService.getCreateProcedureSelections().subscribe((data) => {
      this.loadingFilterData = false;
      this.data = data;
    });

    this.editTypeSelection = 'ORIGINAL';
    // when the text in searchText updates, 2 second after the user stops typing (keyup)
    // will call the function to retrieve the search results
    this.subject.pipe(
      debounceTime(2000)
    ).subscribe(searchText => {
      this.getProcedureSearchResults();
    });

  }

  // when text is entered in the search field, or a filter is changed, triggers this.subject. this.subject will
  // then call getProcedureSearchResults()
  updateProcedureSearchResults() {
    if (!this.loadingFilterData){
      if (this.firstSearch && (this.programSelection != null || this.subsystemSelection != null)
        || (this.searchText && this.searchText.length > 1) ){
        this.getInitialProcedureSearchResults();
        this.firstSearch = false;
      } else {
        this.subject.next();
      }
    }
  }

  // Update value and search
  public updateEditTypeSelection(item){
    this.editTypeSelection = item;
    this.getInitialProcedureSearchResults();
  }

  // Gets the initial set of procedure search results
  public getInitialProcedureSearchResults() {
    this.searchOffset = 0;
    this.results = [];
    this.getProcedureSearchResults();
    this.startSearchSubject.next();
  }

  public getProcedureSearchResults() {
    this.loadingResults = true;
    let searchParameters = this.searchService.generateSearchParameters(
      this.searchText,
      this.programSelection,
      this.subsystemSelection,
      this.testingPhaseSelection,
      this.editTypeSelection,
      this.searchStatusType,
      this.searchOffset,
      this.searchLimit
    );
    this.loggerService.info('Searching for a ' + (this.editTypeSelection ? 'procedure': 'run') + ' with search' +
      ' parameters: ' + searchParameters);

    // Check if configured to search for latest revisions
    if (!this.searchForLatestRevisions) {
      this.searchService.searchForProcedure(this.editTypeSelection, searchParameters).then((data) => {
        this.results = data.procedureDetails;
        this.numberOfResults = data.numResults;
        this.loadingResults = false;
        this.firstSearch = false;
      });
    } else {
      this.searchService.searchForProcedureDef(this.editTypeSelection, searchParameters).then((data) => {
        // Filter latest revisions from list of procedure defs
        let latestRevisions = this.searchService.filterDefsForLatestRevisions(data.procedureDefs);
        // Set values
        this.results = latestRevisions;
        this.numberOfResults = data.numResults;
        this.loadingResults = false;
        this.firstSearch = false;
      });
    }
  }

  // when one of the results is selected, this function will broadcast/emit the selected procedure back to the parent component
  public onSelect(event) {
    this.resultSelection.emit(event);
  }
}
