import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookingDeclarationComponent } from './booking-declaration/booking-declaration.component';
import { HomeComponent } from './home/home.component';
import { NameTableComponent } from './name-table/name-table.component';
import { NavbarFourComponent } from './navbar-four/navbar-four.component';
import { ProjectDeleteDialogComponent } from './project-delete-dialog/project-delete-dialog.component';
import { ProjectComponent } from './project/project.component';
import { RouterPagesSwitcherComponent } from './router-pages-switcher/router-pages-switcher.component';
import { TaskComponent } from './task/task.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { MatStepperModule } from '@angular/material/stepper';
import { StatsComponent } from './stats/stats.component';
import { CommonModule } from '@angular/common';
import { MatInputModule }from '@angular/material/input';
import { StatsVisualizationComponent } from './stats-visualization/stats-visualization.component';
import { QueryTimeBoundariesComponent } from './query-time-boundaries/query-time-boundaries.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import { QueryGroupCategoryComponent } from './query-group-category/query-group-category.component';
import { CommitComponent } from './commit/commit.component';
import { StatsByCategoryTableComponent } from './stats-by-category-table/stats-by-category-table.component';
import { BookingComponent } from './booking/booking.component';
import { DaySelectComponent } from './day-select/day-select.component';
import { ConfigurableStatsTableComponent } from './configurable-stats-table/configurable-stats-table.component';
import { ContextComponent } from './context/context.component';
import { IsCsvFileWrittenComponent } from './is-csv-file-written/is-csv-file-written.component';
import { StartStopComponent } from './start-stop/start-stop.component';
import { LoginComponent } from './login/login.component';
import { TimeVisualizationComponent } from './time-visualization/time-visualization.component';
import { SessionTimeVisualizationComponent } from './session-time-visualization/session-time-visualization.component';
import { WorkingTimeVisualizationComponent } from './working-time-visualization/working-time-visualization.component';
import { WeeklyWorkingTimeVisualizationComponent } from './weekly-working-time-visualization/weekly-working-time-visualization.component';
import { WorkingHoursComponent } from './working-hours/working-hours.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QueryDateComponent } from './query-date/query-date.component';

// https://stackoverflow.com/questions/51190415/angular-2-to-angular-5-upgrade-issue/51190624
// import { registerLocaleData } from '@angular/common';
// import localeDe from '@angular/common/locales/de';
// import localeDeExtra from '@angular/common/locales/extra/de';

// registerLocaleData(localeDe, 'de-DE', localeDeExtra);

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
    QueryDateComponent
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
    FormsModule
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
