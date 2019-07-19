import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';

// https://stackoverflow.com/questions/38209713/how-to-make-a-responsive-nav-bar-using-angular-material-2
// https://material.angular.io/guide/getting-started
import {FlexLayoutModule} from '@angular/flex-layout';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule, MatTableModule, MatMenuModule, MatToolbarModule, MatIconModule, MatSidenavModule, MatListModule, MatFormFieldModule, MatSelectModule } from '@angular/material';
import { NavbarTwoComponent } from './navbar-two/navbar-two.component';
import { LayoutModule } from '@angular/cdk/layout';
import { NavbarFourComponent } from './navbar-four/navbar-four.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { RouterPagesSwitcherComponent } from './router-pages-switcher/router-pages-switcher.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ProjectComponent } from './project/project.component';
import { TaskComponent } from './task/task.component';
import { CommitComponent } from './commit/commit.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { CompletedTimeEntryComponent } from './completed-time-entry/completed-time-entry.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NavbarTwoComponent,
    NavbarFourComponent,
    HomeComponent,
    UserComponent,
    RouterPagesSwitcherComponent,
    TimeTrackingComponent,
    ProjectComponent,
    TaskComponent,
    CommitComponent,
    CompletedTaskComponent,
    CompletedTimeEntryComponent
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
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
