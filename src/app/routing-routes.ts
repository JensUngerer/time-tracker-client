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

  public static routes: Routes = [{
    path: RoutingRoutes.viewsPrefix + 'home',
    component: HomeComponent,
    data: {
      label: 'Home'
    }
  },
  // {
  //   path: RoutingRoutes.viewsPrefix + 'user',
  //   component: UserComponent,
  //   data: {
  //     label: 'User-Management'
  //   }
  // },
  {
    path: RoutingRoutes.viewsPrefix + 'project',
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
    path: RoutingRoutes.viewsPrefix + 'commit',
    component: CommitComponent,
    data: {
      label: 'Commit'
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
    path: '',
    redirectTo: RoutingRoutes.viewsPrefix + 'home',
    pathMatch: 'full'
  }];
}
