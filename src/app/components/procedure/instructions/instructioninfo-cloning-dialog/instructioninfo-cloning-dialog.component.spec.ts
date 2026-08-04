import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {InstructioninfoCloningDialogComponent} from './instructioninfo-cloning-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ProceduresearchComponent } from '../../proceduresearch/proceduresearch.component';
import { RedBlackLineCommentComponent } from '@app/components/red-black-line-comment/red-black-line-comment.component';
import { CommentChangeTypeSelectComponent } from '@app/components/comment-change-type-select/comment-change-type-select.component';

describe('InstructioninfoCloningDialogComponent', () => {
  let component: InstructioninfoCloningDialogComponent;
  let fixture: ComponentFixture<InstructioninfoCloningDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        InstructioninfoCloningDialogComponent,
        ProceduresearchComponent,
        RedBlackLineCommentComponent,
        CommentChangeTypeSelectComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructioninfoCloningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
