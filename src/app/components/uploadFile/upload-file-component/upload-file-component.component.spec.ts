import {waitForAsync, ComponentFixture, TestBed} from '@angular/core/testing';

import {UploadFileComponentComponent} from './upload-file-component.component';
import { AppTestingModule } from '@app/app-testing-module';
import { ImageDisplayComponentComponent } from '../image-display-component/image-display-component.component';

describe('UploadFileComponentComponent', () => {
  let component: UploadFileComponentComponent;
  let fixture: ComponentFixture<UploadFileComponentComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ AppTestingModule ],
      declarations: [
        UploadFileComponentComponent,
        ImageDisplayComponentComponent,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
