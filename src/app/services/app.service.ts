import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  pageTitleSource = new Subject<string>();
  pageTitleChanged = this.pageTitleSource.asObservable();
  browserTitleSource = new Subject<string>();
  browserTitleChange = this.browserTitleSource.asObservable();
  
  constructor() { }

  announcePageTitleChange(pageTitle: string): void {
    this.pageTitleSource.next(pageTitle);
  }

  announceBrowserTitleChange(browserTitle: string): void {
    this.browserTitleSource.next(browserTitle);
  }
}
