import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Route, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';

import { RoutingRoutes } from './../routing-routes';

@Component({
  selector: 'mtt-router-pages-switcher',
  templateUrl: './router-pages-switcher.component.html',
  styleUrls: ['./router-pages-switcher.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class RouterPagesSwitcherComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper;

  private urlForwardMapping: { [key: string]: string } = {};
  private urlBackwardMapping: { [key: string]: string } = {};
  constructor(private router: Router) {

    for (let index = 0; index < RoutingRoutes.routes.length - 2; index++) {
      const oneRoute = RoutingRoutes.routes[index];
      const nextRoute = RoutingRoutes.routes[index + 1];

      this.urlForwardMapping['/' + oneRoute.path] = '/' + nextRoute.path;
      this.urlBackwardMapping['/' + nextRoute.path] = '/' + oneRoute.path;
    }
    this.urlBackwardMapping['/' + RoutingRoutes.routes[0].path] = null;
    this.urlForwardMapping['/' + RoutingRoutes.routes[RoutingRoutes.routes.length - 2].path] = null;

    for (let index = 0; index < RoutingRoutes.routes.length - 1; index++) {
      const element = RoutingRoutes.routes[index];
      const configObj = {};
      configObj[index] = new FormControl('');
      this.formGroups.push(new FormGroup(configObj));
    }
  }
  ngAfterViewInit(): void {
    this.router.events
      .subscribe((e: RouterEvent) => {
        if (!e || !e.url) {
          return;
        }
        const currentIndex = RoutingRoutes.routes.findIndex((oneRoutingRoute: Route) => {
          return e.url.includes(oneRoutingRoute.path);
        });
        if (currentIndex < 0) {
          console.error('cannot set selectedIndex of stepper');
          return;
        }

        this.stepper.selectedIndex = currentIndex;
      });
  }

  public isForwardButtonDisabled = true;
  public isBackwardButtonDisabled = true;

  formGroups: FormGroup[] = [];
  routingRoutes = RoutingRoutes.routes;

  private routerEventsSubscription: Subscription = null;
  private isReadySubscription: Subscription = null;

  ngOnInit() {
    this.routerEventsSubscription = this.router.events.subscribe(() => {
      this.triggerUrlCheck();
    });
  }

  private triggerUrlCheck() {
    const prefix = this.getPrefixOfRouterUrl();
    this.isForwardButtonDisabled = this.checkIsForwardButtonDisabled(prefix);
    this.isBackwardButtonDisabled = this.checkIsBackwardButtonDisabled(prefix);
  }

  private checkIsForwardButtonDisabled(currentUrl: string): boolean {
    return this.urlForwardMapping[currentUrl] ? false : true;
  }

  private checkIsBackwardButtonDisabled(currentUrl: string): boolean {
    return this.urlBackwardMapping[currentUrl] ? false : true;
  }

  private onForwardButtonClicked() {
    const prefix = this.getPrefixOfRouterUrl();
    this.router.navigate([this.urlForwardMapping[prefix]]);
  }

  private onBackwardButtonClicked() {
    const prefix = this.getPrefixOfRouterUrl();
    this.router.navigate([this.urlBackwardMapping[prefix]]);
  }

  private getPrefixOfRouterUrl(): string {
    const routerUrl = this.router.url;
    const prefix = this.getRoutePrefix(routerUrl);
    return prefix;
  }

  private getRoutePrefix(url: string) {
    const indexOfQuotationMark = url.indexOf('?');
    if (indexOfQuotationMark === -1) {
      return url;
    }
    const prefix = url.substring(0, indexOfQuotationMark);
    if (prefix) {
      return prefix;
    }
    return '';
  }

  onAnimationDone() {
    const currentEntryIndex = this.stepper.selectedIndex;
    const currentRoute = RoutingRoutes.routes[currentEntryIndex];
    this.router.navigate([currentRoute.path]);
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
    this.isReadySubscription.unsubscribe();
  }
}
