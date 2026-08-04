import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {SearchService} from "@app/services/search.service";
import * as _ from "lodash";
import {Observable, Subscription} from "rxjs";
import {Utils} from "@app/utils";

@Component({
  selector: 'app-global-search-infinite-scroll',
  templateUrl: './global-search-infinite-scroll.component.html',
  styleUrls: ['./global-search-infinite-scroll.component.css']
})
export class GlobalSearchInfiniteScrollComponent implements OnInit, OnChanges {
  @Input() editType: any;
  @Input() numOfResults: any;
  @Input() searchText: any;
  @Input() programSelection: any;
  @Input() subsystemSelection: any;
  @Input() testingPhaseSelection: any;
  @Input() searchStatus: any;
  @Input() startSearchEvent: Observable<void> = new Observable<void>();
  @Input() results: ProcedureDetails[] = [];
  @Input() details: ProcedureDetails;
  @Output() selection: EventEmitter<any> = new EventEmitter();
  @Input() selector: string;
  @Input() searchForLatestRevisions: boolean = false;
  @Input() resultsFromParentLoaded: boolean = false;

  firstSearch: boolean;
  private startSearchSub: Subscription;
  offsetResults: number = 0;
  limitResults: number = Utils.getSearchLimit();
  allResultsLoaded: boolean = true;

  constructor(public searchService: SearchService) { }

  ngOnInit(): void {
    this.startSearchSub = this.startSearchEvent.subscribe(() => this.startSearch());
  }

  ngOnChanges(changes) {
    if (!_.isNil(this.results)) {
      if (this.numOfResults === this.results.length) {
        this.allResultsLoaded = true;
      }
    }
  }

  ngOnDestroy() {
    this.startSearchSub.unsubscribe();
  }

  private startSearch() {
    this.firstSearch = true;
    this.allResultsLoaded = false;
    this.results = [];
  }

  public onScroll() {
    //only search if there's input criteria on scroll
    this.allResultsLoaded = false;
    if (this.programSelection != null || this.subsystemSelection != null || (this.searchText && this.searchText.length > 1)) {
      if (this.results) {
        if (this.numOfResults === this.results.length) {
          this.allResultsLoaded = true;
          return;
        }
      }

      if (this.firstSearch) {
        this.offsetResults = 0;
      }
      this.offsetResults += this.limitResults;

      let searchParameters = this.searchService.generateSearchParameters(
        this.searchText,
        this.programSelection,
        this.subsystemSelection,
        this.testingPhaseSelection,
        this.editType,
        this.searchStatus,
        this.offsetResults,
        this.limitResults
      );

      // Check if configured to search for procedure details
      if (!this.searchForLatestRevisions) {
        this.searchService.searchForProcedure(this.editType, searchParameters).then((data) => {
          this.results = _.concat(this.results, data.procedureDetails);
          this.allResultsLoaded = true;
        });
      } else {
        this.searchService.searchForProcedureDef(this.editType, searchParameters).then((data) => {
          // Filter latest revisions from list of procedure defs
          let latestRevisions = this.searchService.filterDefsForLatestRevisions(data.procedureDefs);
          // Set values
          this.results = _.concat(this.results, latestRevisions);
          this.allResultsLoaded = true;
        });
      }
      this.firstSearch = false;
    }
  }

  public selectDetails(details) {
    this.selection.emit(details);
  }
}
