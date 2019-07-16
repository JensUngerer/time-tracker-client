import { RoutingRoutes } from './../routing-routes';
import { Component, OnInit, Output } from '@angular/core';
import { Route } from '@angular/router';

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

  @Output()
  public navItems: INavbarItem[] = [];

  constructor() {
    RoutingRoutes.routes.forEach((route: Route, index: number) => {
      if (index === RoutingRoutes.routes.length - 1) {
        return;
      }
      this.navItems.push({
        label: route.data.label,
        path: route.path
      })
    });
  }


  ngOnInit() {
  }

}
