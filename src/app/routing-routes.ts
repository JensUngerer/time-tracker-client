import { Routes } from '@angular/router';

import * as routesConfig from './../../../common/typescript/routes.js';
import { AuthentificationService } from './authentification.service';
import { BookingDeclarationComponent } from './booking-declaration/booking-declaration.component';
import { BookingComponent } from './booking/booking.component';
import { CommitComponent } from './commit/commit.component';
import { ContextComponent } from './context/context.component';
import { LoginComponent } from './login/login.component';
import { ProjectComponent } from './project/project.component';
import { StatsVisualizationComponent } from './stats-visualization/stats-visualization.component';
import { StatsComponent } from './stats/stats.component';
import { TaskComponent } from './task/task.component';
import { TicketHoursComponent } from './ticket-hours/ticket-hours.component.js';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ViewLabels } from './viewLabelsEnum';
import { ViewPaths } from './viewPathsEnum';
import { WorkingHoursComponent } from './working-hours/working-hours.component';

export class RoutingRoutes {
  public static viewsPrefix = routesConfig.viewsPrefix;

  private static startRoute = ViewPaths.login;

  public static routes: Routes = [
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.login,
      component: LoginComponent,
      data: {
        label: ViewLabels.login
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.bookingDeclaration,
      component: BookingDeclarationComponent,
      data: {
        label: ViewLabels.bookingDeclaration
      },
      canActivate: [AuthentificationService]
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.project,
      component: ProjectComponent,
      data: {
        label: ViewLabels.projectManagement
      },
      canActivate: [AuthentificationService]
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.task,
      component: TaskComponent,
      data: {
        label: ViewLabels.taskManagement
      },
      canActivate: [AuthentificationService]
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.timeTracking,
      component: TimeTrackingComponent,
      data: {
        label: ViewLabels.timeTracking
      },
      canActivate: [AuthentificationService]
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.ticketHours,
      component: TicketHoursComponent,
      data: {
        label: ViewLabels.ticketHours
      },
      canActivate: [AuthentificationService]
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.workingHours,
      component: WorkingHoursComponent,
      data: {
        label: ViewLabels.workingHours
      },
      canActivate: [AuthentificationService]
    },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.statistics,
      component: StatsComponent,
      data: {
        label: ViewLabels.statistics
      },
      canActivate: [AuthentificationService]
    },
    // {
    //   path: RoutingRoutes.viewsPrefix + ViewPaths.statisticsVisualization,
    //   component: StatsVisualizationComponent,
    //   data: {
    //     label: ViewLabels.statisticsVisualization
    //   },
    //   canActivate: [AuthentificationService]
    // },
    {
      path: RoutingRoutes.viewsPrefix + ViewPaths.context,
      component: ContextComponent,
      data: {
        label: ViewLabels.context
      },
      canActivate: [AuthentificationService]
    },
    // {
    //   path: RoutingRoutes.viewsPrefix + ViewPaths.commit,
    //   component: CommitComponent,
    //   data: {
    //     label: ViewLabels.commit,
    //     isTaskBased: true
    //   },
    //   canActivate: [AuthentificationService]
    // },
    // {
    //   path: RoutingRoutes.viewsPrefix + ViewPaths.book,
    //   component: BookingComponent,
    //   data: {
    //     label: ViewLabels.book,
    //     isBookingBased: true
    //   },
    //   canActivate: [AuthentificationService]
    // },
    {
      path: '',
      redirectTo: RoutingRoutes.viewsPrefix + RoutingRoutes.startRoute,
      pathMatch: 'full',
      data: {
        label: ''
      }
    }];

  private static ROUTE_INDEX_OF_PROJECT_VIEW = 2;
  private static ROUTE_INDEX_OF_LOGIN_VIEW = 0;

  public static routeAfterSuccesfulLogin = RoutingRoutes.routes[RoutingRoutes.ROUTE_INDEX_OF_PROJECT_VIEW].path;
  public static routeAfterSuccesfulLogout =  RoutingRoutes.routes[RoutingRoutes.ROUTE_INDEX_OF_LOGIN_VIEW].path;
}
