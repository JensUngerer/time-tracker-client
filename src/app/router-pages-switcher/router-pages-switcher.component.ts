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

  staticFormGroup  = new FormGroup({});

  private currentRealIndex: number;

  private urlForwardMapping: { [key: string]: string } = {};
  private urlBackwardMapping: { [key: string]: string } = {};
  private currentUrl = '';
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


    this.router.events
    .subscribe((e: RouterEvent) => {
      if (!e || !e.url || this.currentUrl === e.url) {
        return;
      } else {
        this.currentUrl = e.url;
      }
      this.isLoading = true;
      if (typeof this.currentRealIndex === 'undefined') {
        const currentRealIndex = RoutingRoutes.routes.findIndex((oneRoutingRoute: Route) => {
          return e.url.includes(oneRoutingRoute.path);
        });
        if (currentRealIndex < 0) {
          console.error('cannot set selectedIndex of stepper');
          return;
         }
         this.currentRealIndex = currentRealIndex;
         this.createCurrentIndices(this.currentRealIndex);
      }
      

      this.setCurrentIndex(this.currentRealIndex);
      this.isLoading = false;
    });
  }

  ngAfterViewInit(): void {
      // // this.isLoading = true;
      // this.createCurrentIndices(1);
      // this.setCurrentIndex(1)
      // // this.isLoading = false;
  }

  private setCurrentIndex(currentRealIndex: number) {
    const displayedIndex = this.realIndexToDisplayedIndexMap[currentRealIndex];
    // this.isLoading = false;

    if (this.stepper) {
      this.stepper.selectedIndex = displayedIndex;
    }

  }

  private createCurrentIndices(currentRealIndex: number)  {
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
      this.displayedIndexToRealIndexMap[2] = currentRealIndex  +1 ;

      // this.displayedIndexToRealIndexMap[this.realIndexToDisplayedIndexMap[currentRealIndex]] = 1;
      // this.displayedIndexToRealIndexMap[this.realIndexToDisplayedIndexMap[currentRealIndex + 1]] = 2;

      // this.displayedIndexToRealIndexMap[0] = currentRealIndex -1;
      // this.realIndexToDisplayedIndexMap[currentRealIndex] = 1;
      // this.displayedIndexToRealIndexMap[1] = currentRealIndex;
      // this.realIndexToDisplayedIndexMap[currentRealIndex + 1] = 2;
      // this.displayedIndexToRealIndexMap[2] = currentRealIndex + 1;
    } else {
      this.realIndexToDisplayedIndexMap[currentRealIndex - 2] = 0;
      this.displayedIndexToRealIndexMap[0] = currentRealIndex -2;
      this.realIndexToDisplayedIndexMap[currentRealIndex - 1] = 1;
      this.displayedIndexToRealIndexMap[1] = currentRealIndex -1;
      this.realIndexToDisplayedIndexMap[currentRealIndex] = 2;
      this.displayedIndexToRealIndexMap[2] = currentRealIndex;
    }

  }

  public isForwardButtonDisabled = true;
  public isBackwardButtonDisabled = true;

  isLoading = true;
  formGroups: FormGroup[] = [];
  routingRoutes = RoutingRoutes.routes;
  displayedIndexes: number[] = [0, 1, 2];
  displayedIndexToRealIndexMap: {[displayedIndex: number]: number} = {};
  realIndexToDisplayedIndexMap: {[displayedIndex: number]: number} = {};

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
    const currentDisplayedEntryIndex = this.stepper.selectedIndex;
    this.currentRealIndex = this.displayedIndexToRealIndexMap [currentDisplayedEntryIndex];
    this.createCurrentIndices(this.currentRealIndex);
    // this.
    // this.currentRealIndex = this.displayedIndexToRealIndexMap[currentDisplayedEntryIndex];

    const currentRoute = RoutingRoutes.routes[this.currentRealIndex];
    this.router.navigate([currentRoute.path]);
  }

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
    this.isReadySubscription.unsubscribe();
  }
}
