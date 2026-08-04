import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfflineService } from '@app/services/offline.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  public tabId: number = 0;

  constructor(
    public offlineService: OfflineService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe( paramMap => {
      this.tabId = parseInt(paramMap.get('tabId'));
    });
  }

  public onSelectedIndexChange(newIndex: number) {
    this.router.navigate(['admin/', newIndex]);
  }

}
