import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { ProjectComponent } from './project/project.component';

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
    path: 'timeTracking',
    component: TimeTrackingComponent,
    data: {
      label: 'Time-Tracking'
    }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  }];
}
