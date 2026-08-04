import { TestBed } from '@angular/core/testing';

import { MessageService } from './message.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('MessageService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      MatSnackBarModule,
    ],
  }));

  it('should be created', () => {
    const service: MessageService = TestBed.inject(MessageService);
    expect(service).toBeTruthy();
  });
});
