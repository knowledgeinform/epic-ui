import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import {Subscription} from "rxjs";
import {Utils} from '@app/utils';
import * as _ from 'lodash';

import { MessageService } from '@app/services/message.service';
import { TablePasteParserService } from '@app/services/table-paste-parser.service';

@Component({
  selector: 'app-summernote-editor',
  templateUrl: './summernote-editor.component.html',
  styleUrls: ['./summernote-editor.component.css'],
})

export class SummernoteEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() text: string = '';
  @Input() disableHints: boolean = false;
  @Input() airMode: boolean = false;
  @Input() disableEditor: boolean = false;
  @Input() isProcedureDraft: boolean = true;
  @Output() textChange = new EventEmitter<string>();
  @Output() keydownProxy = new EventEmitter<KeyboardEvent>();
  @Output() pasteIntercept = new EventEmitter<ClipboardEvent>();

  // Set by parent via @Input to determine if this editor is inside a table context.
  // When true, multi-cell paste is intercepted and preventDefault() is called.
  @Input() interceptMultiCellPaste: boolean = false;

  maxLength = Utils.getMaxRichTextEditorLength();
  private subscriptions: {[sub: string]: Subscription};
  form: UntypedFormGroup;

  config = {
    placeholder: '',
    tabsize: 2,
    height: '200px',
    disableDragAndDrop: true,
    callbacks: {
      paste: (event: ClipboardEvent) => this.onSummernotePaste(event)
    },
    toolbar: [
      ['view', ['undo', 'redo']],
      ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
      ['fontsize', ['fontname', 'fontsize']],
      ['para', ['ul', 'ol', 'paragraph', 'height']],
      ['insert', ['table', 'hr', 'link']]
    ],
    fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times'],
    dialogsInBody: true,
  }

  configAir = {
    airMode: true,
    disableDragAndDrop: true,
    callbacks: {
      paste: (event: ClipboardEvent) => this.onSummernotePaste(event)
    },
    popover: {
      air: [
        ['fontsize', ['fontname', 'fontsize']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['para', ['paragraph']]
      ],
    }
  }

  constructor(private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private pasteParser: TablePasteParserService) {}

  ngOnInit() {

    this.form = new UntypedFormGroup({
      html: new UntypedFormControl(this.text, [Validators.maxLength(this.maxLength), Validators.required])
    });

    //Getting text changes and sending value back to the parent component via emit emitter
    this.form.get('html').valueChanges.subscribe(val => {
      if (this.text !== val && val !== null){
        if (this.airMode && !this.isProcedureDraft) {
            this.debounceText(val);
        } else {
          this.textChange.emit(val);
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // When the text input changes externally (e.g., via multi-cell paste),
    // update the form without emitting textChange back (avoid loop).
    if (changes.text && !changes.text.firstChange) {
      const current = this.form.get('html')?.value;
      if (current !== this.text) {
        this.form.get('html')?.setValue(this.text, { emitEvent: false });
      }
    }
  }

  private debounceText = _.debounce(value => {
    this.textChange.emit(value);
  }, 2000);

  ngOnDestroy() {
    _.forEach(this.subscriptions, sub => sub.unsubscribe());
  }

  /**
   * Called by Summernote's callbacks.paste BEFORE it processes the clipboard.
   * If multi-cell paste is detected and intercept is enabled, prevent Summernote
   * from processing and emit to the parent table to handle instead.
   * Returns false to signal Summernote to skip its internal paste processing.
   */
  private onSummernotePaste(event: ClipboardEvent): void | boolean {
    if (!this.interceptMultiCellPaste) {
      return; // Not in table context — let Summernote handle normally.
    }

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const htmlData = clipboardData.getData('text/html');
    const plainData = clipboardData.getData('text/plain');
    const grid = this.pasteParser.parse(htmlData, plainData);

    if (grid && this.pasteParser.isMultiCell(grid, htmlData)) {
      // Multi-cell detected — prevent Summernote from processing this paste.
      event.preventDefault();
      event.stopPropagation();
      this.pasteIntercept.emit(event);
      return false; // Signal Summernote to skip internal paste handling.
    }
    // Single-cell: return undefined — Summernote continues normally.
  }

  /**
   * When text is pasted into the RTE, remove the background and font color styling from the text,
   * but keep the rest of styles.
   * @param event
   * @returns
   */
  onPasteText(event: ClipboardEvent) {

    const clipboardData = event.clipboardData;
    let pastedData = clipboardData.getData('text/html');
    let isHtml = true;

    if (_.isNil(pastedData) || pastedData.length === 0) {
      pastedData = clipboardData.getData('text/plain');
      isHtml = false;
    }

    if (_.isNil(pastedData) || pastedData.length === 0) {
      this.messageService.showSnackBar('Could not determine the type of data; please paste from a text document', 'CLOSE', 5000);
      return;
    }

    if (isHtml) {
      // On some platform or browsers, such as windows, only fetch content between this pair of string tags
      const startFragmentTagStr: string = "<!--StartFragment-->";
      const endFragmentTagStr: string = "<!--EndFragment-->";
      if (pastedData.includes(startFragmentTagStr) && pastedData.includes(endFragmentTagStr)) {
        let startIndex = pastedData.indexOf(startFragmentTagStr);
        let endIndex = pastedData.indexOf(endFragmentTagStr);
        // Get the actually copied text with its styles between <!--StartFragment--> and <!--EndFragment-->
        pastedData = pastedData.substring(startIndex + startFragmentTagStr.length, endIndex);
      }
      // Remove content in "dangerous tags such as <script>.
      pastedData = Utils.cleanPastedHTML(pastedData);
      // Preserve basic formatting but drop style-heavy Word attributes/tags.
      pastedData = Utils.sanitizePastedRichText(pastedData);
      // Then strip out color and highlight background
      pastedData = Utils.cleanFontColorAndBackground(pastedData);
    }
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    // Prevent the browser/editor from running its default paste behavior first
    event.preventDefault();

    // Use browser insert commands so Summernote keeps its internal range/undo state consistent
    // (Manual Range mutations can desync Summernote and cause IndexSizeError on toolbar/undo actions)
    const inserted = isHtml
      ? document.execCommand('insertHTML', false, pastedData)
      : document.execCommand('insertText', false, pastedData);

    if (!inserted) {
      // Fallback for environments where execCommand is unavailable.
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = isHtml ? document.createElement('div') : document.createTextNode(pastedData);
      if (isHtml) {
        (node as HTMLElement).innerHTML = pastedData;
      }
      range.insertNode(node);
    }

    return false;
  }
  hidePopover(event) {
    // Don't want to display editor poover
    let popovers = document.getElementsByClassName('note-popover');
    _.forEach(popovers, po => {
      let newPo = po;
      newPo.setAttribute('hidden', 'true')
      newPo.setAttribute('style', 'display: none');
      po.parentNode.replaceChild(po, newPo);
    });
  }

  onKeydown(event: KeyboardEvent): void {
    this.keydownProxy.emit(event);
  }
}
