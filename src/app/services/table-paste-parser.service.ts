import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TablePasteParserService {

  /**
   * Parse clipboard data into a 2D grid of cell values.
   * Only processes Excel HTML tables — Word content returns null
   * so it passes through to Summernote for single-cell rich text paste.
   *
   * @param html - HTML clipboard data (from Excel, browsers, etc.)
   * @param plainText - Plain text clipboard data (TSV fallback)
   */
  parse(html: string, plainText: string): string[][] | null {
    // Only parse Excel HTML tables
    if (html && !this.isWordRichText(html)) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const rows = doc.querySelectorAll('tr');
      if (rows.length > 0) {
        const grid = this.extractGrid(rows);
        if (grid.length > 0) return grid;
      }
    }

    return null;
  }

  /**
   * Determine if the parsed grid represents a multi-cell paste.
   * Since parse() only returns grids for Excel content, we know
   * the grid is Excel data — just check dimensions.
   *
   * @param grid - Parsed cell values (always from Excel)
   * @param html - Raw HTML from clipboard (unused, kept for API compatibility)
   */
  isMultiCell(grid: string[][], _html: string): boolean {
    const hasMultipleCols = grid[0]?.length > 1;
    const hasMultipleRows = grid.length > 1;
    return hasMultipleCols || hasMultipleRows;
  }

  /**
   * Detect if the HTML is Word rich text (as opposed to Excel table data).
   *
   * Strategy: return false only if we positively identify Excel (xmlns:x).
   * Otherwise, assume Word rich text — the safer default for single-column
   * multi-row data, since distributing Word paragraphs across cells would
   * destroy formatting.
   *
   * @param html - Raw HTML from clipboard
   */
  private isWordRichText(html: string): boolean {
    // Excel-specific namespace → definitely NOT Word → distribute
    if (/xmlns:x="urn:schemas-microsoft-com:office:excel"/.test(html)) {
      return false;
    }
    // Everything else → rich text, don't distribute
    return true;
  }

  /**
   * Extract cell text content from HTML table rows.
   * Handles both <td> and <th> tags. Strips formatting, trims whitespace.
   */
  private extractGrid(rows: NodeListOf<HTMLElement>): string[][] {
    return Array.from(rows)
      .map(row =>
        Array.from(row.querySelectorAll('td, th'))
          .map(cell => (cell.textContent || '').trim())
      )
      .filter(row => row.length > 0);
  }

  /**
   * Parse tab-separated values into a 2D grid.
   */
  private parseTabSeparatedValues(text: string): string[][] {
    return text.split(/\r?\n/)
      .filter(row => row.trim())
      .map(row => row.split('\t').map(cell => cell.trim()));
  }
}
