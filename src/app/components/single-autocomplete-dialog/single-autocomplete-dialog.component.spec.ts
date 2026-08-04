import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleAutocompleteDialogComponent } from './single-autocomplete-dialog.component';
import { AppTestingModule } from '@app/app-testing-module';
import { autocompleteDialogBinderMock } from '@app/test/autocomplete-dialog-binder.mock';

describe('SingleAutocompleteDialogComponent', () => {
  let component: SingleAutocompleteDialogComponent;
  let fixture: ComponentFixture<SingleAutocompleteDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [ SingleAutocompleteDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleAutocompleteDialogComponent);
    component = fixture.componentInstance;
    component.validator = autocompleteDialogBinderMock;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
