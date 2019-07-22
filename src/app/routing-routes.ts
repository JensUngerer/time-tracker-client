import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ProjectComponent } from './project/project.component';
import { TaskComponent } from './task/task.component';
import { CommitComponent } from './commit/commit.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { CompletedTimeEntryComponent } from './completed-time-entry/completed-time-entry.component';
import * as routesConfig from './../../../common/typescript/routes.js';

export class RoutingRoutes {

  public static viewsPrefix = routesConfig.viewsPrefix;

  public static startRoute = 'project';

  public static routes: Routes = [
    {
      path: RoutingRoutes.viewsPrefix + RoutingRoutes.startRoute,
      component: ProjectComponent,
      data: {
        label: 'Project-Management'
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + 'task',
      component: TaskComponent,
      data: {
        label: 'Task-Management'
      }
    },
    {
      path: RoutingRoutes.viewsPrefix + 'timeTracking',
      component: TimeTrackingComponent,
      data: {
        label: 'Time-Tracking'
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
