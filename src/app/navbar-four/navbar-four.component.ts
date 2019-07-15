import { Component, OnInit, Output } from '@angular/core';

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

  constructor() { }

  @Output()
  public navItems: INavbarItem[] = [
    {
      label: 'Home',
      path: 'home'
    },
    {
      label: 'User-Management',
      path: 'user'
    }
  ];
  ngOnInit() {
  }

}
