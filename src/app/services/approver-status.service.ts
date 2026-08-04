import { Injectable } from '@angular/core';
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ApproverStatusService {
  procedureDetailsSource = new Subject<ProcedureDetails>();

  approverStatusChanged = this.procedureDetailsSource.asObservable();

  constructor() { }

  announceApproverStatusChange(procedureDetails: ProcedureDetails) {
    this.procedureDetailsSource.next(procedureDetails);
  };
}
