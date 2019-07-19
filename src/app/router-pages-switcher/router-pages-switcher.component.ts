import { RoutingRoutes } from './../routing-routes';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'mtt-router-pages-switcher',
  templateUrl: './router-pages-switcher.component.html',
  styleUrls: ['./router-pages-switcher.component.scss', './../css/centerVerticalHorizontal.scss']
})
export class RouterPagesSwitcherComponent implements OnInit {

  private currentUrl$: Observable<UrlSegment[]> = null;

  private urlForwardMapping: {[key: string]: string} = {};
  private urlBackwardMapping: {[key: string]: string} = {};
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) {
                this.currentUrl$ = this.activatedRoute.url;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[0]] = null;

                this.urlForwardMapping['/' + RoutingRoutes.routes[0].path] = '/' + RoutingRoutes.routes[1].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[1].path] = '/' + RoutingRoutes.routes[0].path;


                this.urlForwardMapping['/' + RoutingRoutes.routes[1].path] = '/' + RoutingRoutes.routes[2].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[2].path] = '/' + RoutingRoutes.routes[1].path;


                this.urlForwardMapping['/' + RoutingRoutes.routes[2].path] = '/' + RoutingRoutes.routes[3].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[3].path] = '/' + RoutingRoutes.routes[2].path;


                this.urlForwardMapping['/' + RoutingRoutes.routes[3].path] = '/' + RoutingRoutes.routes[4].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[4].path] = '/' + RoutingRoutes.routes[3].path;

                this.urlForwardMapping['/' + RoutingRoutes.routes[4].path] = '/' + RoutingRoutes.routes[5].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[5].path] = '/' + RoutingRoutes.routes[4].path;

                this.urlForwardMapping['/' + RoutingRoutes.routes[5].path] = '/' + RoutingRoutes.routes[6].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[6].path] = '/' + RoutingRoutes.routes[5].path;

                this.urlForwardMapping['/' + RoutingRoutes.routes[6].path] = '/' + RoutingRoutes.routes[7].path;
                this.urlBackwardMapping['/' + RoutingRoutes.routes[7].path] = '/' + RoutingRoutes.routes[6].path;

                this.urlForwardMapping['/' + RoutingRoutes.routes[7].path] = null;
              }

  public isForwardButtonDisabled = false;
  public isBackwardButtonDisabled = false;

  ngOnInit() {
    this.router.events.subscribe(() => {
      const prefix = this.getPrefixOfRouterUrl();
      this.isForwardButtonDisabled = this.checkIsForwardButtonDisabled(prefix);
      this.isBackwardButtonDisabled = this.checkIsBackwardButtonDisabled(prefix);
    });
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

  // private getNextRoute(currentUrl: string): string {
  //   const nextUrl: string = this.urlForwardMapping[currentUrl];
  //   return nextUrl;
  // }
}
