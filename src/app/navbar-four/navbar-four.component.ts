import { Component, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';

import { AuthentificationService } from '../authentification.service';
import { RoutingRoutes } from './../routing-routes';

export interface INavbarItem {
  label: string;
  path: string;
}

@Component({
  selector: 'mtt-navbar-four',
  templateUrl: './navbar-four.component.html',
  styleUrls: ['./navbar-four.component.scss']
})
export class NavbarFourComponent implements OnInit {
  private readonly isLoggedOutColor = 'accent';
  private readonly isLoggedInColor = 'primary';

  color = this.isLoggedOutColor;

  public navItems: INavbarItem[] = [];
  isMenuVisible = false;
  isLoggedIn = false;
 

  constructor(private authentificationService: AuthentificationService,
    private router: Router) {
    RoutingRoutes.routes.forEach((route: Route, index: number) => {
      if (index === RoutingRoutes.routes.length - 1) {
        return;
      }
      this.navItems.push({
        label: route.data.label,
        path: route.path
      });
    });
  }

  private setStatusViaIsLoggedIn() {
    const isLoggedInStatusPromise = this.authentificationService.getLoginStatus();
    isLoggedInStatusPromise.then((isLoggedIn: boolean)=>{
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.isMenuVisible = true;
        this.color = this.isLoggedInColor;
      } else  {
        this.isMenuVisible = false;
        this.color = this.isLoggedOutColor;
      }
    });
    isLoggedInStatusPromise.catch((err: any) => {
      console.error(JSON.stringify(err, null, 4));
    }); 
  }

  ngOnInit() {
    this.setStatusViaIsLoggedIn();
  }

  logout() {
    const logoutRequestPromise = this.authentificationService.logout();
    logoutRequestPromise.then(() => { 
      this.setStatusViaIsLoggedIn();
      this.router.navigate([RoutingRoutes.routeAfterSuccesfulLogout]);
    });
    logoutRequestPromise.catch((err: any) => {
      console.error(JSON.stringify(err, null, 4));
    }); 
  }

}
