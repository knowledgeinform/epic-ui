import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTestingModule } from '@app/app-testing-module';

import { SignCommentComponent } from './sign-comment.component';
import { stepBlackLineMockArray } from '@app/test/black-line.mock';
import { LineEditService } from '@app/services/line-edit.service';
import { blackLineSignatureMock } from '@app/test/second-signature.mock';
import { of } from 'rxjs';
import * as _ from 'lodash';
import { MessageService } from '@app/services/message.service';

describe('SignCommentComponent', () => {
  let component: SignCommentComponent;
  let fixture: ComponentFixture<SignCommentComponent>;
  let lineEditService: LineEditService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ SignCommentComponent ],
      providers: [
        LineEditService,
        MessageService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignCommentComponent);
    component = fixture.componentInstance;
    // make sure a fresh independent copy is created for each test
    component.comment = _.cloneDeep(stepBlackLineMockArray[0]);
    component.comment.blackRedLineSignatures = [];
    component.redLines = false;
    lineEditService = fixture.debugElement.injector.get(LineEditService);
    component.formControl.setValue('user1111111');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update comment with signature given a valid username and pin', () => {
    let data = [blackLineSignatureMock];
    expect(component.formControl.valid).toBeTruthy();
    component.formControl.setValue('user1111111');
    let lineEditServiceSpy = spyOn(lineEditService, 'saveBlackRedLineSignature').and.returnValue(of(data));
    component.submitSignature();

    expect(lineEditServiceSpy).toHaveBeenCalled();
    expect(component.comment.blackRedLineSignatures.length).toEqual(1);
    expect(component.comment.blackRedLineSignatures[0]).toEqual(blackLineSignatureMock);
    expect(component.state).toEqual(component.STATES.SIGNED);
  });

  it('should display error message if save fails', () => {
    let data: any = {errorMessage: 'Failed to save signature'};
    let lineEditServiceSpy = spyOn(lineEditService, 'saveBlackRedLineSignature').and.returnValue(of(data));
    component.submitSignature();
    expect(lineEditServiceSpy).toHaveBeenCalled();
    expect(_.isNil(component.comment.blackRedLineSignatures) || _.isEmpty(component.comment.blackRedLineSignatures)).toBeTruthy();
    expect(component.state).toBeUndefined();
  })

});
