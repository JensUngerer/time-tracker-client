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

                this.urlForwardMapping['/' + RoutingRoutes.routes[4].path] = null;
              }

  public isForwardButtonDisabled = false;
  public isBackwardButtonDisabled = false;

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.isForwardButtonDisabled = this.checkIsForwardButtonDisabled(this.router.url);
      this.isBackwardButtonDisabled = this.checkIsBackwardButtonDisabled(this.router.url);
    });
  }

  private checkIsForwardButtonDisabled(currentUrl: string): boolean {
    return this.urlForwardMapping[currentUrl] ? false : true;
  }

  private checkIsBackwardButtonDisabled(currentUrl: string): boolean {
    return this.urlBackwardMapping[currentUrl] ? false : true;
  }

  public onForwardButtonClicked() {
    this.router.navigate([this.urlForwardMapping[this.router.url]]);
  }

  public onBackwardButtonClicked() {
    this.router.navigate([this.urlBackwardMapping[this.router.url]]);
  }

  // private getNextRoute(currentUrl: string): string {
  //   const nextUrl: string = this.urlForwardMapping[currentUrl];
  //   return nextUrl;
  // }
}
