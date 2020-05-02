// import { InMemoryDataService } from './../in-memory-data.service';
import { RoutingRoutes } from './../routing-routes';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'mtt-router-pages-switcher',
  templateUrl: './router-pages-switcher.component.html',
  styleUrls: ['./router-pages-switcher.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class RouterPagesSwitcherComponent implements OnInit, OnDestroy {
  private currentUrl$: Observable<UrlSegment[]> = null;

  private urlForwardMapping: { [key: string]: string } = {};
  private urlBackwardMapping: { [key: string]: string } = {};
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router) {
    this.currentUrl$ = this.activatedRoute.url;

    for (let index = 0; index < RoutingRoutes.routes.length - 2; index++) {
      const oneRoute = RoutingRoutes.routes[index];
      const nextRoute = RoutingRoutes.routes[index + 1];

      this.urlForwardMapping['/' + oneRoute.path] = '/' + nextRoute.path;
      this.urlBackwardMapping['/' + nextRoute.path] = '/' + oneRoute.path;
    }
    this.urlBackwardMapping['/' + RoutingRoutes.routes[0].path] = null;
    this.urlForwardMapping['/' + RoutingRoutes.routes[RoutingRoutes.routes.length-2].path] = null;
  }

  public isForwardButtonDisabled = true;
  public isBackwardButtonDisabled = true;

  private routerEventsSubscription: Subscription = null;
  private isReadySubscription: Subscription = null;
  // private isReady = false;

  ngOnInit() {
    this.routerEventsSubscription = this.router.events.subscribe(() => {
      // if (this.isReady) {
      this.triggerUrlCheck();
      // }
    });

    // this.isReadySubscription = this.inMemoryDataService.getIsReady().subscribe((isMemoryDataReady: boolean) => {
    //   if (isMemoryDataReady) {
    //     console.error('ready');

    //     this.isReady = true;
    //     this.triggerUrlCheck();
    //   } else {
    //     console.error('waiting for isMemoryDataReady:' + isMemoryDataReady);

    //     this.isForwardButtonDisabled = true;
    //     this.isBackwardButtonDisabled = true;

    //     this.isReady = false;
    //   }
    // });
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

  public onForwardButtonClicked() {
    const prefix = this.getPrefixOfRouterUrl();
    this.router.navigate([this.urlForwardMapping[prefix]]);
  }

  public onBackwardButtonClicked() {
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

  ngOnDestroy(): void {
    this.routerEventsSubscription.unsubscribe();
    this.isReadySubscription.unsubscribe();
  }
}
