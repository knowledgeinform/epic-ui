import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from '@app/components/dashboard/dashboard.component';
import {AuthorprocedureComponent} from './components/procedure/authorprocedure/authorprocedure.component';
import {LoginComponent} from './components/login/login.component';
import {AuthGuard} from './auth.guard';
import {ProcedureRunComponent} from './components/procedure/procedure-run/procedure-run.component';
import {UserProfileComponent} from '@app/components/user-profile/user-profile.component';
import {ProcedureRunPrintComponent} from './components/procedure/procedure-run/procedure-run-print/procedure-run-print.component';
import {AdminComponent} from './components/admin/admin.component';
import {AuthGuardAdmin} from './auth.guard.admin';
import {ProcedureRunPreviewComponent} from '@app/components/procedure/procedure-run-preview/procedure-run-preview.component';
import {ReportingContainerComponent} from '@app/components/reporting/reporting-container/reporting-container.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { ProgramComponent } from './components/programs/program/program.component';
import {ProgramExportDownloadComponent} from "@app/components/program-export-download/program-export-download.component";

const routes: Routes = [
  {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'procedure/:id', redirectTo: 'procedure/:id/0'},
  {path: 'procedure/:id/:tab', component: AuthorprocedureComponent, canActivate: [AuthGuard]},
  {path: 'run/:id', redirectTo: 'run/:id/0'},
  {path: 'run/:id/:tab', component: ProcedureRunComponent, canActivate: [AuthGuard]},
  {path: 'print/:itemType/:id', component: ProcedureRunPrintComponent, canActivate: [AuthGuard]},
  {path: 'preview/:id', component: ProcedureRunPreviewComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard]},
  {path: 'admin', redirectTo: 'admin/0'},
  {path: 'admin/:tabId', component: AdminComponent, canActivate: [AuthGuard, AuthGuardAdmin]},
  {path: 'reporting', component: ReportingContainerComponent, canActivate: [AuthGuard]},
  {path: 'programs', component: ProgramsComponent, canActivate: [AuthGuard]},
  {path: 'programs/:programCode', redirectTo: 'programs/:programCode/0'},
  {path: 'programs/:programCode/:tabId', component: ProgramComponent, canActivate: [AuthGuard]},
  {path: 'download/:programExportId', component: ProgramExportDownloadComponent, canActivate: [AuthGuard]},
  // otherwise redirect to login page
  {path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled'
  })]
})


export class AppRoutingModule {
}
