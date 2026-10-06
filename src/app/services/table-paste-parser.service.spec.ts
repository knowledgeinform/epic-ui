import { TestBed } from '@angular/core/testing';
import { TablePasteParserService } from './table-paste-parser.service';

describe('TablePasteParserService', () => {
  let service: TablePasteParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TablePasteParserService);
  });

  describe('parse', () => {
    it('should parse Excel HTML table (with xmlns:x namespace)', () => {
      const result = service.parse(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>A</td><td>B</td></tr>
          <tr><td>C</td><td>D</td></tr>
        </table>
      `, '');

      expect(result).toEqual([
        ['A', 'B'],
        ['C', 'D']
      ]);
    });

    it('should return null for Word HTML (no Excel namespace)', () => {
      const result = service.parse(`
        <table>
          <tr><td>Word content</td></tr>
        </table>
      `, '');
      expect(result).toBeNull();
    });

    it('should return null for plain HTML table', () => {
      const result = service.parse(`
        <table>
          <tr><td>Plain</td><td>Table</td></tr>
        </table>
      `, '');
      expect(result).toBeNull();
    });

    it('should return null for non-table HTML', () => {
      const result = service.parse('<p>Just text</p>', 'Just text');
      expect(result).toBeNull();
    });

    it('should return null for empty input', () => {
      const result = service.parse('', '');
      expect(result).toBeNull();
    });

    it('should trim whitespace from Excel cell values', () => {
      const result = service.parse(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td>  spaced  </td><td>  value  </td></tr>
        </table>
      `, '');
      expect(result).toEqual([['spaced', 'value']]);
    });

    it('should handle Excel HTML with styling artifacts', () => {
      const result = service.parse(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel" border=0 cellpadding=0 cellspacing=0 width=704 style='border-collapse:collapse;width:528pt'>
          <col width=64 span=11 style='width:48pt'>
          <tr><td height=19 width=64 style='height:14.4pt;width:48pt'>Name</td><td width=64 style='width:48pt'>Value</td></tr>
          <tr><td>Test</td><td align=right>42</td></tr>
        </table>
      `, '');

      expect(result).toEqual([
        ['Name', 'Value'],
        ['Test', '42']
      ]);
    });

    it('should handle <th> tags in Excel pasted table', () => {
      const result = service.parse(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><th>Header</th><th>Data</th></tr>
        </table>
      `, '');
      expect(result).toEqual([['Header', 'Data']]);
    });

    it('should strip HTML tags from Excel cell content', () => {
      const result = service.parse(`
        <table xmlns:x="urn:schemas-microsoft-com:office:excel">
          <tr><td><b>bold</b> text</td></tr>
        </table>
      `, '');
      expect(result).toEqual([['bold text']]);
    });
  });

  describe('isMultiCell', () => {
    it('should return true for multiple rows AND multiple columns', () => {
      expect(service.isMultiCell([['A', 'B'], ['C', 'D']], '')).toBeTrue();
    });

    it('should return true for single row with multiple columns', () => {
      expect(service.isMultiCell([['A', 'B', 'C']], '')).toBeTrue();
    });

    it('should return true for single-column multi-row (Excel data)', () => {
      expect(service.isMultiCell([['A'], ['B'], ['C']], '')).toBeTrue();
    });

    it('should return false for single cell', () => {
      expect(service.isMultiCell([['Only']], '')).toBeFalse();
    });
  });
});
