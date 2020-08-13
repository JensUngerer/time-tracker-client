import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { Route, Router, RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';

import { RoutingRoutes } from './../routing-routes';

@Component({
  selector: 'mtt-router-pages-switcher',
  templateUrl: './router-pages-switcher.component.html',
  styleUrls: ['./router-pages-switcher.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class RouterPagesSwitcherComponent implements OnDestroy, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper;

  private static threeIndicesToDisplay = [0, 1, 2];
  staticFormGroup = new FormGroup({});

  private currentRealIndex: number;

  private performRouterEventSubscription: Subscription;

  private urlForwardMapping: { [key: string]: string } = {};
  private urlBackwardMapping: { [key: string]: string } = {};
  private currentUrl = '';
  private currentRoute: Route;
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
      if (this.performRouterEventSubscription) {
        this.performRouterEventSubscription.unsubscribe();
      }
      this.performRouterEventSubscription = this.router.events
        .subscribe(this.performRouteEvent.bind(this));
  }

  private performRouteEvent(e: RouterEvent) {
    this.triggerUrlCheck();
    if (!e || !e.url || this.currentUrl === e.url) {
      return;
    } else {
      this.currentUrl = e.url;
    }
    this.initIndices(e);
  }

  private initIndices(e: RouterEvent) {
    if (typeof this.currentRealIndex === 'undefined') {
      let currentRealIndex = RoutingRoutes.routes.findIndex((oneRoutingRoute: Route) => {
        return e.url.includes(oneRoutingRoute.path);
      });
      if (currentRealIndex < 0) {
        console.error('cannot set selectedIndex of stepper');
        return;
      }
      if (currentRealIndex === RoutingRoutes.routes.length - 1) {
        // redirection
        const searchString = RoutingRoutes.routes[currentRealIndex].redirectTo;
        const indexOfProject = RoutingRoutes.routes.findIndex((oneRoutingRouteToRedirect: Route) => {
          return oneRoutingRouteToRedirect.path === searchString;
        });
        currentRealIndex = indexOfProject;
      }
      this.currentRealIndex = currentRealIndex;
      this.createCurrentIndices(this.currentRealIndex);
    }


    if (this.stepper) {
      this.setCurrentIndex(this.currentRealIndex);
    }
  }

  private setCurrentIndex(currentRealIndex: number) {
    const displayedIndex = this.realIndexToDisplayedIndexMap[currentRealIndex];

    if (this.stepper) {
      this.stepper.selectedIndex = displayedIndex;
    }
  }

  private createCurrentIndices(currentRealIndex: number) {
    this.realIndexToDisplayedIndexMap = [];
    this.displayedIndexToRealIndexMap = [];
    if (currentRealIndex <= 1) {
      this.realIndexToDisplayedIndexMap[0] = 0;
      this.displayedIndexToRealIndexMap[0] = 0;
      this.realIndexToDisplayedIndexMap[1] = 1;
      this.displayedIndexToRealIndexMap[1] = 1;
      this.realIndexToDisplayedIndexMap[2] = 2;
      this.displayedIndexToRealIndexMap[2] = 2;
    } else if (currentRealIndex >= 2 && currentRealIndex < RoutingRoutes.routes.length - 2) {
      this.realIndexToDisplayedIndexMap[currentRealIndex - 1] = 0;
      this.realIndexToDisplayedIndexMap[currentRealIndex] = 1;
      this.realIndexToDisplayedIndexMap[currentRealIndex + 1] = 2;

      this.displayedIndexToRealIndexMap[0] = currentRealIndex - 1;
      this.displayedIndexToRealIndexMap[1] = currentRealIndex;
      this.displayedIndexToRealIndexMap[2] = currentRealIndex + 1;
    } else {
      this.realIndexToDisplayedIndexMap[currentRealIndex - 2] = 0;
      this.displayedIndexToRealIndexMap[0] = currentRealIndex - 2;
      this.realIndexToDisplayedIndexMap[currentRealIndex - 1] = 1;
      this.displayedIndexToRealIndexMap[1] = currentRealIndex - 1;
      this.realIndexToDisplayedIndexMap[currentRealIndex] = 2;
      this.displayedIndexToRealIndexMap[2] = currentRealIndex;
    }
  }

  public isForwardButtonDisabled = true;
  public isBackwardButtonDisabled = true;

  formGroups: FormGroup[] = [];
  routingRoutes = RoutingRoutes.routes;
  displayedIndexes: number[] = RouterPagesSwitcherComponent.threeIndicesToDisplay;
  displayedIndexToRealIndexMap: { [displayedIndex: number]: number } = {};
  realIndexToDisplayedIndexMap: { [displayedIndex: number]: number } = {};

  private isReadySubscription: Subscription = null;

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
    const currentDisplayedEntryIndex = this.stepper.selectedIndex;
    this.currentRealIndex = this.displayedIndexToRealIndexMap[currentDisplayedEntryIndex];

    this.createCurrentIndices(this.currentRealIndex);

    this.currentRoute = RoutingRoutes.routes[this.currentRealIndex];

    if (this.currentRoute &&
      ('/' + this.currentRoute.path) === this.currentUrl) {
      return;
    }
    this.router.navigate([this.currentRoute.path]);
  }

  ngOnDestroy(): void {
    // this.routerEventsSubscription.unsubscribe();
    if (this.performRouterEventSubscription) {
      this.performRouterEventSubscription.unsubscribe();
    }
    if (this.isReadySubscription) {
      this.isReadySubscription.unsubscribe();
    }
  }
}
