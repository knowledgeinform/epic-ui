import {Component, Input, OnInit} from '@angular/core';
import {EPICWSService} from '@app/services/epic-ws.service';
import { HttpResponse } from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {EditType} from '@app/interfaces/edit-type.dto';
import {LoggerService} from '@app/services/logger.service';
import {AttachmentService} from '@app/services/attachment.service';
import { MessageService } from '@app/services/message.service';

@Component({
  selector: 'app-image-display-component',
  templateUrl: './image-display-component.component.html',
  styleUrls: ['./image-display-component.component.css']
})
export class ImageDisplayComponentComponent implements OnInit {

  @Input() attachmentPk: number;
  @Input() filename = 'Unknown';
  @Input() editType: EditType = EditType.ORIGINAL;
  imageToShow: any;
  public EditType = EditType;

  isImageLoading = true;
  isError = false;

  constructor(private attachmentService: AttachmentService,
              private sanitizer: DomSanitizer,
              private loggerService: LoggerService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.isImageLoading = true;
    this.loggerService.info('Retrieving image attachment with pk ' + this.attachmentPk);
    this.attachmentService.downloadAttachment(this.attachmentPk).subscribe((res) => {
      if (res.headers) {
        const contentDisposition = res.headers.get('content-disposition');
        this.filename = contentDisposition.split(';')[1].split('filename')[1].split('=')[1].trim();
        this.createImageFromBlob(res.body);
      } else {
        this.isError = true;
        this.loggerService.error('Unable to load image with pk ' + this.attachmentPk);
        this.messageService.showSnackBar('Unable to load attachment due to error with connecting to attachments server', 'CLOSE', 10000);
      }
      this.isImageLoading = false;
    });
  }

  createImageFromBlob(image: Blob) {
    if (this.imageToShow) {
      URL.revokeObjectURL(this.imageToShow.toString()); // release previous URL
    }
    if (image) {
      this.imageToShow = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(image));
    }
  }

  ngOnDestroy() {
    if (this.imageToShow) {
      URL.revokeObjectURL(this.imageToShow.toString());
    }
  }
}
