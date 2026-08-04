import {Component, OnInit} from '@angular/core';
import {EPICWSService} from "@app/services/epic-ws.service";
import {
  CommunicationBanner,
  CommunicationBannerMessageType
} from "@app/components/admin/communication-banner-config/communication-banner-config.component";
import {timer} from "rxjs";

@Component({
  selector: 'app-communication-banner',
  templateUrl: './communication-banner.component.html',
  styleUrls: ['./communication-banner.component.css']
})
export class CommunicationBannerComponent implements OnInit{
  protected readonly CommunicationBannerMessageType = CommunicationBannerMessageType;
  communicationBanner: CommunicationBanner;

  constructor(private epicWsService: EPICWSService) {
  }


  ngOnInit() {
    this.getBanner();
    timer(0, 5000).subscribe(() => {this.getBanner()});
  }

  /**
   * Get existing banner.
   */
  getBanner() {
    this.epicWsService.getCommunicationBanner().subscribe(
      {
        next: (banner: CommunicationBanner) => {
        if(banner !== undefined && banner !== null) {
          this.communicationBanner = banner;
        } else {
          this.communicationBanner = undefined;
        }
    }, error: err => {}});
  }

}
