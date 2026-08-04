import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {

  selection;
  selectedEditType;
  selectedVersion;
  testingPhase;
  procedureDetails: any[];
  constructor(private router: Router) {
  }


  receiveSearchSelection(selectionObj): void {
    this.selectedEditType = undefined;
    this.selection = undefined;
    this.procedureDetails = undefined;
    this.selectedVersion = undefined;
    if (selectionObj === null) {
      return;
    }
    this.selection = selectionObj.selection;
    this.selectedEditType = selectionObj.editType;
    this.testingPhase = selectionObj.testingPhase;
    this.procedureDetails = [];
    // if (this.selectedEditType === 'ORIGINAL') {
     this.selection.procedureDetails.forEach(version => {
       if (version.editType === this.selectedEditType || (this.selectedEditType === 'RUN' && version.editType !== 'ORIGINAL')) {
         if (this.selectedEditType !== 'ORIGINAL') {
           // check testing phase
           if (this.testingPhase === null || this.testingPhase === undefined) {
             this.procedureDetails.push(version);
           } else if (this.testingPhase !== null && this.testingPhase !== undefined &&
             version.run.testingPhase.pk === this.testingPhase) {
             this.procedureDetails.push(version);
           }
         } else {
           this.procedureDetails.push(version);
         }
       }
     });
    // }
  }

  /**
   * This method loads the selected procedureDef Version by routing the user to that view.
   */
  loadSearchSelection(): void {
    if (this.selectedEditType === 'ORIGINAL') {
      // if here, a procedure with a version was selected
      // go to that version via the procedure route
      this.router.navigate(['procedure', this.selectedVersion.id]);
    }
    if (this.selectedEditType === 'RUN') {
      this.router.navigate(['run', this.selectedVersion.id, 0]);
    }
  }

}
