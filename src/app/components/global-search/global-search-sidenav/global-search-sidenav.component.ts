import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {EPICWSService} from "@app/services/epic-ws.service";
import {OfflineService} from "@app/services/offline.service";
import {MessageService} from "@app/services/message.service";
import {MatDialog} from "@angular/material/dialog";
import {LoggerService} from "@app/services/logger.service";
import {debounceTime} from "rxjs/operators";
import {SearchService} from "@app/services/search.service";
import {Utils} from "@app/utils";
import {Router} from "@angular/router";

@Component({
  selector: 'app-global-search-sidenav',
  templateUrl: './global-search-sidenav.component.html',
  styleUrls: ['./global-search-sidenav.component.scss']
})
export class GlobalSearchSidenavComponent implements OnInit {

  @Input() searchText: any [];
  @Input() searchStatusType: string;
  @Output() sidenav: EventEmitter<any> = new EventEmitter();

  results: any;
  data: any;
  programSelection: number;
  subsystemSelection: number;
  testingPhaseSelection: number;
  editType: string = "ORIGINAL";              // Used for tracking the edit type for search results
  editTypeSelection: string = this.editType;  // Edit Type selection value - editType will update to equal this value when search is triggered
  searchLimit: number = Utils.getSearchLimit();
  searchOffset: number = 0;
  loadingResults: boolean = false;
  loadingFilterData: boolean = false;
  numberOfResults: number;
  selector: string = '.infinite-scroll-parent';

  private subject: Subject<string> = new Subject<string>();
  startSearchSubject: Subject<void> = new Subject<void>();

  constructor(public epicService: EPICWSService,
              public offlineService: OfflineService,
              public messageService: MessageService,
              public errorDialog: MatDialog,
              public loggerService: LoggerService,
              public searchService: SearchService,
              public router: Router) { }

  ngOnInit(): void {
  }

  // when text is entered in the search field, or a filter is changed, triggers this.subject. this.subject will
  // then call getProcedureSearchResults()
  updateProcedureSearchResults() {
    this.subject.next();
  }

  // Update value and search
  public updateEditTypeSelection(item){
    this.editTypeSelection = item;
  }

  // Gets the initial set of procedure search results
  public getInitialProcedureSearchResults() {
    this.loadingResults = true;
    this.startSearchSubject.next();
    this.searchOffset = 0;
    this.results = [];
    // set edit type to match selected edit type filter
    this.editType = this.editTypeSelection;
    this.getProcedureSearchResults();
  }

  public getProcedureSearchResults() {
    this.loadingResults = true;
    let searchParameters = this.searchService.generateSearchParameters(
      this.searchText,
      this.programSelection,
      this.subsystemSelection,
      this.testingPhaseSelection,
      this.editType,
      this.searchStatusType,
      this.searchOffset,
      this.searchLimit
    );
    this.loggerService.info('Searching for a ' + (this.editType ? 'procedure': 'run') + ' with search' +
    ' parameters: ' + searchParameters);
    this.searchService.searchForProcedure(this.editType, searchParameters).then((data) => {
          this.results = data.procedureDetails;
          this.numberOfResults = data.numResults;
          this.loadingResults = false;
    });
  }

  toggle() {
    this.sidenav.emit();
  }

  clearFilterSelections() {
    this.editTypeSelection = "ORIGINAL";
    this.testingPhaseSelection = undefined;
    this.programSelection = undefined;
    this.subsystemSelection = undefined;
  }

  public listenToClick() {
    // on initiation, get program and subsystem data to populate the drop-down filters
    this.loadingFilterData = true;
    this.loggerService.info('Retrieving program/subsystem/testing phase options');
    this.epicService.getCreateProcedureSelections().subscribe((data) => {
      this.loadingFilterData = false;
      this.data = data;
    });

    this.subject.pipe(
      debounceTime(1000)
    ).subscribe(searchText => {
      if (this.searchText != null) {
        this.getInitialProcedureSearchResults();
      }
    });
  }

  goToSearchResult(details){
    if (details.editType === 'ORIGINAL') {
      this.router.navigate(
          ['/procedure', details.id]
        );
    } else {
      this.router.navigate(
        ['/run', details.id]
      );
    }
  }
}
