import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericCommentHistoryDisplayComponent } from './generic-comment-history-display.component';
import {AppTestingModule} from '@app/app-testing-module';

describe('GenericCommentHistoryDisplayComponent', () => {
  let component: GenericCommentHistoryDisplayComponent;
  let fixture: ComponentFixture<GenericCommentHistoryDisplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ GenericCommentHistoryDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericCommentHistoryDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
