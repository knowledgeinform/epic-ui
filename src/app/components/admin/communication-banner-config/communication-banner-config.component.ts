import {Component, OnInit} from '@angular/core';
import {EPICWSService} from "@app/services/epic-ws.service";


export enum CommunicationBannerMessageType {
  INFO = "INFO",
  WARNING = "WARNING",
  ERROR = "ERROR"
}

export class CommunicationBanner {
  id: number;
  message: string;
  messageType: CommunicationBannerMessageType;
  expiry: string;  // date string YYYY-MM-DD
}

@Component({
  selector: 'app-communication-banner-config',
  templateUrl: './communication-banner-config.component.html',
  styleUrls: ['./communication-banner-config.component.css']
})
export class CommunicationBannerConfigComponent implements OnInit {

  protected readonly CommunicationBannerMessageType = CommunicationBannerMessageType;
  communicationBanner = new CommunicationBanner();

  objectKeys = Object.keys;
  communicationBannerMessageType = CommunicationBannerMessageType;

  constructor(private epicWsService: EPICWSService) {
  }


  ngOnInit() {
    this.getBanner();
  }

  /**
   * Get existing banner.
   */
  getBanner() {
    this.epicWsService.getCommunicationBanner().subscribe(
      {
        next: (banner: CommunicationBanner) => {
          if (banner !== undefined && banner !== null) {
            this.communicationBanner = banner;
          }
        },
        error: err => {}
      }
    );
  }

  postBanner() {
    this.epicWsService.postCommunicationBanner(this.communicationBanner).then((response) => {});
  }

  removeBanner() {
    this.epicWsService.removeCommunicationBanner().then((response) => {
      this.communicationBanner = new CommunicationBanner();
    });

  }

  isNotValid() {
    return this.communicationBanner.message === undefined ||
      this.communicationBanner.message.trim().length < 1 ||
      this.communicationBanner.message === undefined ||
      this.communicationBanner.message === null ||
      this.communicationBanner.messageType === undefined ||
      this.communicationBanner.messageType === null
  }


}
