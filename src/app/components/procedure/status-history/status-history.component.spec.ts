import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusHistoryComponent } from './status-history.component';
import { AppTestingModule } from '@app/app-testing-module';
import {GenericCommentHistoryDisplayComponent} from '@app/components/generic-comment-history-display/generic-comment-history-display.component';

describe('StatusHistoryComponent', () => {
  let component: StatusHistoryComponent;
  let fixture: ComponentFixture<StatusHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ StatusHistoryComponent,
        GenericCommentHistoryDisplayComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
