import { Routes } from '@angular/router';
// import { HomeComponent } from './home/home.component';
// import { UserComponent } from './user/user.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ProjectComponent } from './project/project.component';
import { TaskComponent } from './task/task.component';
import { CommitComponent } from './commit/commit.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { CompletedTimeEntryComponent } from './completed-time-entry/completed-time-entry.component';
import * as routesConfig from './../../../common/typescript/routes.js';
import { ViewLabels } from './viewLabelsEnum';
import { ViewPaths } from './viewPathsEnum';
import { BookingDeclarationComponent } from './booking-declaration/booking-declaration.component';

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
      path: RoutingRoutes.viewsPrefix + 'completedTask',
      component: CompletedTaskComponent,
      data: {
        label: 'Completed-Tasks'
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + 'completedTimeEntry',
      component: CompletedTimeEntryComponent,
      data: {
        label: 'Completed-Time-Entries'
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + 'commit',
      component: CommitComponent,
      data: {
        label: 'Commit'
      }
    },
    {
      path: '',
      redirectTo: RoutingRoutes.viewsPrefix + RoutingRoutes.startRoute,
      pathMatch: 'full'
    }];
}
