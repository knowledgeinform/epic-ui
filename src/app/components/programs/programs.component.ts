import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgramDTO } from '@app/interfaces/program.dto';
import { EPICWSService } from '@app/services/epic-ws.service';
import { LoginService } from '@app/services/login.service';
import { OfflineService } from '@app/services/offline.service';
import { CreateProgramComponent } from '../admin/create-program/create-program.component';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})
export class ProgramsComponent implements OnInit {

  public programs: ProgramDTO[] = [];

  constructor(
    private epicService: EPICWSService,
    private dialog: MatDialog,
    public loginService: LoginService,
    public offlineService: OfflineService,
  ) { }

  ngOnInit() {
    this.loadPrograms();
  }

  private loadPrograms() {
    this.epicService.getPrograms().then(programs => {
      this.programs = programs;
    });
  }

  public createProgram() {
    const dialog = this.dialog.open(CreateProgramComponent);
    dialog.afterClosed().subscribe( () => {
      this.loadPrograms();
    });
    dialog.componentInstance.onSubmit.subscribe( success => {
      if (success) dialog.close();
    });
  }

}
