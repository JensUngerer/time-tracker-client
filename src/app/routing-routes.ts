import { Routes } from '@angular/router';

import * as routesConfig from './../../../common/typescript/routes.js';
import { BookingDeclarationComponent } from './booking-declaration/booking-declaration.component';
import { CommitOrBookComponent } from './commit-or-book/commit-or-book.component';
import { CommitComponent } from './commit/commit.component.js';
import { ProjectComponent } from './project/project.component';
import { StatsVisualizationComponent } from './stats-visualization/stats-visualization.component.js';
import { StatsComponent } from './stats/stats.component.js';
import { TaskComponent } from './task/task.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ViewLabels } from './viewLabelsEnum';
import { ViewPaths } from './viewPathsEnum';

export class RoutingRoutes {

  public static viewsPrefix = routesConfig.viewsPrefix;

  public static startRoute = ViewPaths.project;

  public static routes: Routes = [
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.bookingDeclaration,
      component: BookingDeclarationComponent,
      data: {
        label: ViewLabels.bookingDeclaration
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + RoutingRoutes.startRoute,
      component: ProjectComponent,
      data: {
        label: ViewLabels.projectManagement
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.task,
      component: TaskComponent,
      data: {
        label: ViewLabels.taskManagement
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.timeTracking,
      component: TimeTrackingComponent,
      data: {
        label: ViewLabels.timeTracking
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.statistics,
      component: StatsComponent,
      data: {
        label: ViewLabels.statistics
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.statisticsVisualization,
      component: StatsVisualizationComponent,
      data: {
        label: ViewLabels.statisticsVisualization
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.commit,
      component: CommitComponent,
      data: {
        label: ViewLabels.commit,
        isTaskBased: true
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.book,
      component: CommitOrBookComponent,
      data: {
        label: ViewLabels.book,
        isBookingBased: true
      }
    },
    {
      path: '',
      redirectTo: RoutingRoutes.viewsPrefix + RoutingRoutes.startRoute,
      pathMatch: 'full',
      data: {
        label: ''
      }
    }];
}
