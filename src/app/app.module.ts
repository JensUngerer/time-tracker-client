import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AddTimeEntryComponent } from './add-time-entry/add-time-entry.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingDeclarationComponent } from './booking-declaration/booking-declaration.component';
import { BookingComponent } from './booking/booking.component';
import { CommitComponent } from './commit/commit.component';
import { ConfigurableStatsTableComponent } from './configurable-stats-table/configurable-stats-table.component';
import { ContextComponent } from './context/context.component';
import { DaySelectComponent } from './day-select/day-select.component';
import { DynamicTimeEntriesTableComponent } from './dynamic-time-entries-table/dynamic-time-entries-table.component';
import { ExpandWorkingHoursComponent } from './expand-working-hours/expand-working-hours.component';
import { HomeComponent } from './home/home.component';
import { IsCsvFileWrittenComponent } from './is-csv-file-written/is-csv-file-written.component';
import { LoginComponent } from './login/login.component';
import { ManipulateWorkingHoursComponent } from './manipulate-working-hours/manipulate-working-hours.component';
import { NameTableComponent } from './name-table/name-table.component';
import { NavbarFourComponent } from './navbar-four/navbar-four.component';
import { ProjectDeleteDialogComponent } from './project-delete-dialog/project-delete-dialog.component';
import { ProjectComponent } from './project/project.component';
import { QueryDateComponent } from './query-date/query-date.component';
import { QueryGroupCategoryComponent } from './query-group-category/query-group-category.component';
import { QueryTimeBoundariesComponent } from './query-time-boundaries/query-time-boundaries.component';
import { RouterPagesSwitcherComponent } from './router-pages-switcher/router-pages-switcher.component';
import { SessionTimeVisualizationComponent } from './session-time-visualization/session-time-visualization.component';
import { StartStopComponent } from './start-stop/start-stop.component';
import { StaticTimeEntriesTableComponent } from './static-time-entries-table/static-time-entries-table.component';
import { StatsByCategoryTableComponent } from './stats-by-category-table/stats-by-category-table.component';
import { StatsVisualizationComponent } from './stats-visualization/stats-visualization.component';
import { StatsComponent } from './stats/stats.component';
import { TaskComponent } from './task/task.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { TimeVisualizationComponent } from './time-visualization/time-visualization.component';
import {
  WeeklyWorkingTimeVisualizationComponent,
} from './weekly-working-time-visualization/weekly-working-time-visualization.component';
import { WorkingHoursComponent } from './working-hours/working-hours.component';
import { WorkingTimeVisualizationComponent } from './working-time-visualization/working-time-visualization.component';
import { TicketHoursComponent } from './ticket-hours/ticket-hours.component';
import { ManipulateTicketHoursComponent } from './manipulate-ticket-hours/manipulate-ticket-hours.component';
import { ExpandTicketHoursComponent } from './expand-ticket-hours/expand-ticket-hours.component';

// https://stackoverflow.com/questions/51190415/angular-2-to-angular-5-upgrade-issue/51190624
// https://stackoverflow.com/questions/66010145/missing-locale-data-for-the-locale-de-de
registerLocaleData(localeDe, 'de', localeDeExtra);

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
    ProjectDeleteDialogComponent,
    NameTableComponent,
    BookingDeclarationComponent,
    StatsComponent,
    StatsVisualizationComponent,
    QueryTimeBoundariesComponent,
    QueryGroupCategoryComponent,
    CommitComponent,
    StatsByCategoryTableComponent,
    BookingComponent,
    DaySelectComponent,
    ConfigurableStatsTableComponent,
    ContextComponent,
    IsCsvFileWrittenComponent,
    StartStopComponent,
    LoginComponent,
    TimeVisualizationComponent,
    SessionTimeVisualizationComponent,
    WorkingTimeVisualizationComponent,
    WeeklyWorkingTimeVisualizationComponent,
    WorkingHoursComponent,
    QueryDateComponent,
    StaticTimeEntriesTableComponent,
    DynamicTimeEntriesTableComponent,
    AddTimeEntryComponent,
    ExpandWorkingHoursComponent,
    ManipulateWorkingHoursComponent,
    TicketHoursComponent,
    ManipulateTicketHoursComponent,
    ExpandTicketHoursComponent
  ],
  exports: [
    IsCsvFileWrittenComponent
  ],
  imports: [
    CommonModule,
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
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    HttpClientModule,
    MatDialogModule,
    MatCheckboxModule,
    MatStepperModule,
    MatInputModule,
    MatPaginatorModule,
    FontAwesomeModule,
    FormsModule,
    MatSortModule,
    MatTabsModule
  ],
  providers: [
    // https://stackoverflow.com/questions/37684360/how-to-set-locale-for-numbers-in-angular-2-0
    // https://stackoverflow.com/questions/51190415/angular-2-to-angular-5-upgrade-issue/51190624
    {provide: LOCALE_ID, useValue: 'de'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
