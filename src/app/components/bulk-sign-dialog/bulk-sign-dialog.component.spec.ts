import {ComponentFixture, ComponentFixtureAutoDetect, TestBed} from '@angular/core/testing';

import { BulkSignDialogComponent } from './bulk-sign-dialog.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {LocalStorageService} from "@app/services/local-storage.service";
import {LocalStorageServiceMock} from "@app/services/local-storage.service.mock";
import {JL} from "jsnlog";
import {LoggerService} from "@app/services/logger.service";
import {nodeListMock} from "@app/test/node-list.mock";
import {LineEditService} from "@app/services/line-edit.service";
import {MessageService} from "@app/services/message.service";
import {blackLineSignatureMock} from "@app/test/second-signature.mock";
import {of} from "rxjs";
import {procedureDetailsLockedRunMock} from "@app/test/procedure-details.mock";
import {MatStepperModule} from "@angular/material/stepper";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {programRoleMock} from "@app/test/program-role.mock";
import {SignCommentComponent} from "@app/components/line-edit-comments/sign-comment/sign-comment.component";
import {stepBlackLineMockArray} from "@app/test/black-line.mock";
import {RoleSelectionComponent} from "@app/components/role-selection/role-selection.component";
import {ProcedureDetails} from "@app/interfaces/procedure-details";
import {FormControl, Validators} from "@angular/forms";
import {DebugElement} from "@angular/core";
import {By} from "@angular/platform-browser";
import {SelectionModel} from "@angular/cdk/collections";
import {SGNode} from "@app/components/multi-select-groups-steps/multi-select-groups-steps.component";
import { AppPipesModule } from '@app/app-material/app-pipes.module';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
describe('BulkSignDialogComponent', () => {
  let component: BulkSignDialogComponent;
  let lineEditService: LineEditService;
  let fixture: ComponentFixture<BulkSignDialogComponent>;
  let loggerService: LoggerService;
  let messageService: MessageService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [BulkSignDialogComponent, SignCommentComponent],
    imports: [MatSnackBarModule, MatDialogModule, MatStepperModule,
        BrowserAnimationsModule, AppPipesModule],
    providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {
                close: () => { },
            } },
        { provide: 'JSNLog', useValue: JL },
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: ComponentFixtureAutoDetect, useValue: true },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
})
    .compileComponents();

  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkSignDialogComponent);
    component = fixture.componentInstance;
    const nodeList = nodeListMock;
    component.checklistSelection.selected.push(nodeList[0]);
    component.checklistSelection.selected.push(nodeList[1]);
    component.procedureData = procedureDetailsLockedRunMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle correct blackredlinesignature response', () => {
    let signature: string = 'smithjh1123456';
    lineEditService = TestBed.inject(LineEditService);
    loggerService = TestBed.inject(LoggerService);
    messageService = TestBed.inject(MessageService);

    component.receiveRoleSelectionSelection(programRoleMock);
    const nodeList = nodeListMock;
    component.checklistSelection.selected.push(nodeList[0]);
    component.checklistSelection.selected.push(nodeList[1]);
    component.receiveCommentSelection(component.checklistSelection);
    fixture.detectChanges();
    component.signCommentComponent.formControl.setValue(signature);
    fixture.detectChanges();

    let data = [blackLineSignatureMock];

    let lineEditServiceSpy = spyOn(lineEditService, 'saveBlackRedLineSignature').and.returnValue(of(data));
    let loggerServiceSpy = spyOn<LoggerService, any>(loggerService, 'info');
    let messageServiceSpy = spyOn<MessageService, any>(messageService, 'showSnackBar');

    let lineSignSpy = spyOn<BulkSignDialogComponent, any>(component, 'lineSign').and.callThrough();
    component.lineSign();

    expect(lineEditServiceSpy).toHaveBeenCalled();
    expect(loggerServiceSpy).toHaveBeenCalledWith('Successfully saved signature for line edits');
    expect(messageServiceSpy).toHaveBeenCalledWith("Line edit approval saved", 'CLOSE');

  });

  it('should handle incorrect blackredlinesignature response', () => {
    let signature: string = 'smithjh1123456';
    lineEditService = TestBed.inject(LineEditService);
    loggerService = TestBed.inject(LoggerService);
    messageService = TestBed.inject(MessageService);

    component.receiveRoleSelectionSelection(programRoleMock);
    const nodeList = nodeListMock;
    component.checklistSelection.selected.push(nodeList[0]);
    component.checklistSelection.selected.push(nodeList[1]);
    component.receiveCommentSelection(component.checklistSelection);
    fixture.detectChanges();
    component.signCommentComponent.formControl.setValue(signature);

    let data: any = {errorMessage: 'Failed to save signature'};

    let lineEditServiceSpy = spyOn(lineEditService, 'saveBlackRedLineSignature').and.returnValue(of (data));
    let loggerServiceSpy = spyOn<LoggerService, any>(loggerService, 'error');
    let messageServiceSpy = spyOn<MessageService, any>(messageService, 'showSnackBar');

    let lineSignSpy = spyOn<BulkSignDialogComponent, any>(component, 'lineSign').and.callThrough();
    component.lineSign();

    expect(lineEditServiceSpy).toHaveBeenCalled();
    expect(loggerServiceSpy).toHaveBeenCalledWith(jasmine.stringMatching('Error saving signature for line edits:'));
    expect(messageServiceSpy).toHaveBeenCalledWith(jasmine.stringMatching('Unable to save'), 'CLOSE', 10000);

  });

});
