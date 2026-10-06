import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummernoteEditorComponent } from './summernote-editor.component';
import {SummernoteEditorCountPercentagePipe} from "@app/pipes/summernote-editor-count-percentage.pipe";
import {AppTestingModule} from "@app/app-testing-module";
import { TablePasteParserService } from '@app/services/table-paste-parser.service';

describe('SummernoteEditorComponent', () => {
  let component: SummernoteEditorComponent;
  let fixture: ComponentFixture<SummernoteEditorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppTestingModule,
      ],
      declarations: [ SummernoteEditorComponent,
        SummernoteEditorCountPercentagePipe,
      ],
      providers: [
        { provide: TablePasteParserService, useClass: TablePasteParserService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummernoteEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSummernotePaste (via callbacks.paste)', () => {
    function createMockPasteEvent(html: string, plainText?: string): ClipboardEvent {
      return {
        clipboardData: {
          getData: (type: string) => {
            if (type === 'text/html') return html;
            if (type === 'text/plain') return plainText || '';
            return '';
          }
        },
        preventDefault: jasmine.createSpy('preventDefault'),
        stopPropagation: jasmine.createSpy('stopPropagation')
      } as unknown as ClipboardEvent;
    }

    it('should emit pasteIntercept and return false for multi-cell HTML paste', () => {
      component.interceptMultiCellPaste = true;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td></tr>
          <tr><td>B</td></tr>
        </table>
      `);

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeFalse();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(emittedEvents.length).toBe(1);
    });

    it('should return undefined for single-cell paste (let Summernote handle)', () => {
      component.interceptMultiCellPaste = true;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent(`
        <table>
          <tr><td>Single</td></tr>
        </table>
      `);

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeUndefined();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(emittedEvents.length).toBe(0);
    });

    it('should do nothing when interceptMultiCellPaste is false', () => {
      component.interceptMultiCellPaste = false;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent(`
        <table>
          <tr><td>A</td></tr>
          <tr><td>B</td></tr>
        </table>
      `);

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeUndefined();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(emittedEvents.length).toBe(0);
    });

    it('should treat single-column TSV as single-cell (rich text)', () => {
      component.interceptMultiCellPaste = true;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent('', 'A\nB\nC');

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeUndefined(); // Single-column → let Summernote handle as rich text
      expect(emittedEvents.length).toBe(0);
    });

    it('should distribute Excel single-column multi-row', () => {
      component.interceptMultiCellPaste = true;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>Row1</td></tr>
          <tr><td>Row2</td></tr>
          <tr><td>Row3</td></tr>
        </table>
      `);

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeFalse(); // Excel-style → distribute
      expect(emittedEvents.length).toBe(1);
    });

    it('should treat Word rich text as single-cell (not multi-cell)', () => {
      component.interceptMultiCellPaste = true;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent(`
        <table xmlns:o="urn:schemas-microsoft-com:office:office">
          <tr><td><p>Executive Summary</p></td></tr>
          <tr><td><p>The ARLO RFI asks whether...</p></td></tr>
        </table>
      `);

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeUndefined(); // Word rich text → let Summernote handle
      expect(emittedEvents.length).toBe(0);
    });

    it('should treat Word MsoNormal paragraphs as single-cell', () => {
      component.interceptMultiCellPaste = true;
      const emittedEvents: ClipboardEvent[] = [];
      component.pasteIntercept.subscribe(e => emittedEvents.push(e));

      const event = createMockPasteEvent(`
        <table>
          <tr><td><p class="MsoNormal">Para 1</p></td></tr>
          <tr><td><p class="MsoNormal">Para 2</p></td></tr>
        </table>
      `);

      const result = (component as any).onSummernotePaste(event);

      expect(result).toBeUndefined();
      expect(emittedEvents.length).toBe(0);
    });
  });
});
