import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ProjectComponent } from './project/project.component';
import { TaskComponent } from './task/task.component';
import { CommitComponent } from './commit/commit.component';
import { CompletedTaskComponent } from './completed-task/completed-task.component';
import { CompletedTimeEntryComponent } from './completed-time-entry/completed-time-entry.component';

export class RoutingRoutes {

  public static routes: Routes = [{
    path: 'home',
    component: HomeComponent,
    data: {
      label: 'Home'
    }
  },
  {
    path: 'user',
    component: UserComponent,
    data: {
      label: 'User-Management'
    }
  },
  {
    path: 'project',
    component: ProjectComponent,
    data: {
      label: 'Project-Management'
    }
  },
  {
    path: 'task',
    component: TaskComponent,
    data: {
      label: 'Task-Management'
    }
  },
  {
    path: 'timeTracking',
    component: TimeTrackingComponent,
    data: {
      label: 'Time-Tracking'
    }
  },
  {
    path: 'commit',
    component: CommitComponent,
    data: {
      label: 'Commit'
    }
  },
  {
    path: 'completedTask',
    component: CompletedTaskComponent,
    data: {
      label: 'Completed-Tasks'
    }
  },
  {
    path: 'completedTimeEntry',
    component: CompletedTimeEntryComponent,
    data: {
      label: 'Completed-Time-Entries'
    }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }];
}
