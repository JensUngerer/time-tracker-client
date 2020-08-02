import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingDeclarationComponent } from './booking-declaration/booking-declaration.component';
import { CommitOrBookTableComponent } from './commit-or-book-table/commit-or-book-table.component';
import { CommitOrBookComponent } from './commit-or-book/commit-or-book.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { CompletedTimeEntryComponent } from './completed-time-entry/completed-time-entry.component';
import { HomeComponent } from './home/home.component';
import { NameTableComponent } from './name-table/name-table.component';
import { NavbarFourComponent } from './navbar-four/navbar-four.component';
import { ProjectDeleteDialogComponent } from './project-delete-dialog/project-delete-dialog.component';
import { ProjectComponent } from './project/project.component';
import { RouterPagesSwitcherComponent } from './router-pages-switcher/router-pages-switcher.component';
import { TaskComponent } from './task/task.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';

// https://stackoverflow.com/questions/38209713/how-to-make-a-responsive-nav-bar-using-angular-material-2
// https://material.angular.io/guide/getting-started
@NgModule({
  entryComponents:[
    ProjectDeleteDialogComponent
  ],
  declarations: [
    AppComponent,
    NavbarFourComponent,
    HomeComponent,
    RouterPagesSwitcherComponent,
    TimeTrackingComponent,
    ProjectComponent,
    TaskComponent,
    CompletedTaskComponent,
    CompletedTimeEntryComponent,
    ProjectDeleteDialogComponent,
    NameTableComponent,
    BookingDeclarationComponent,
    CommitOrBookComponent,
    CommitOrBookTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    LayoutModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    HttpClientModule,
    FontAwesomeModule,
    MatDialogModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
