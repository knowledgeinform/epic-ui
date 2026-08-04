import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { RunstepcommentComponent } from './runstepcomment.component';
import { AppTestingModule } from '@app/app-testing-module';
import { stepDefMock } from '@app/test/step-def.mock';
import {GenericCommentHistoryDisplayComponent} from '@app/components/generic-comment-history-display/generic-comment-history-display.component';

describe('RunstepcommentComponent', () => {
  let component: RunstepcommentComponent;
  let fixture: ComponentFixture<RunstepcommentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ RunstepcommentComponent,
        GenericCommentHistoryDisplayComponent
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunstepcommentComponent);
    component = fixture.componentInstance;
    component.step = stepDefMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
