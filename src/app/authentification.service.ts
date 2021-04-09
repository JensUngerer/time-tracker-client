import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { rawListeners } from 'process';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';
import { environment } from 'src/environments/environment';
import { CommitService } from './commit.service';

export interface ILoginStatus {
  isLoggedIn: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthentificationService implements CanActivate {
  private authentificationExpressOptions: any;

  constructor(private httpClient: HttpClient) { 
    this.authentificationExpressOptions = {... CommitService.httpOptions};
    this.authentificationExpressOptions.withCredentials = true;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.getLoginStatus();
  }

  private generateUrl(urlPostfix: string) {
    return environment.httpBaseUrl + urlPostfix;
  }

  private requestLoginStatus() {
    const loginStatusUrl = this.generateUrl('/api/login-status');
    const httpGetLoginStatus$ = this.httpClient.get<string>(loginStatusUrl, CommitService.httpOptions);
    // httpGetLoginStatus$.pipe(tap(this.printLoginStatus.bind(this))).subscribe();
    return httpGetLoginStatus$;
  }

  private printLoginStatus(loginStatus: any) {
    console.log(JSON.parse(loginStatus));
  }

  logout() {
    const logoutUrl =  this.generateUrl('/api/logout');
    const httpPostLogout$ = this.httpClient.post<string>(logoutUrl, JSON.stringify({}), this.authentificationExpressOptions);
    // httpPostLogout$.pipe(tap(this.requestLoginStatus.bind(this))).subscribe();
    return httpPostLogout$.toPromise();
  }

  getLoginStatus(): Promise<boolean> {
    // const promise =  this.requestLoginStatus().pipe(map((rawLoginStatus: string) => {
    //   return JSON.parse(rawLoginStatus);
    // })).subscribe().toPromise();
    // return promise;
    const request$ = this.requestLoginStatus();
    return request$.pipe<any>(map((rawValue: any)=> {
      const isLoggedInProperty: ILoginStatus = JSON.parse(rawValue);
      return isLoggedInProperty.isLoggedIn;
    })).toPromise();
    // request$.pipe<string>(map<string, void>(() =>  {

    // }));
    // request$.pipe(map((rawIsLoggedIn: string) => {
    //   return JSON.parse(rawIsLoggedIn);
    // }))
    // request$.pipe(map((event: HttpEvent<string>)=> {
    //   return JSON.parse(event);
    // }))
    // request$.pipe(map<string, object>((rawValue: string)=>  {
    //   return JSON.parse(rawValue);
    // }));
    // request$.pipe(map<string, ILoginStatus>((rawValue: string)=>{
    //   return JSON.parse(rawValue);
    // }));
  }

  login(userName: string, password: string) {
     const url = this.generateUrl('/api/login');
    
    const httpPostLogin$ = this.httpClient.post(url, JSON.stringify({
      username: userName,
      password: password
    }),  this.authentificationExpressOptions);
  //   httpPostLogin$.pipe(tap(
  //     this.requestLoginStatus.bind(this)
  //  )).subscribe();
      return new Promise((resolve: (value?:any)=>void, reject:(value?:any)=>void) => {
        const httpPostLoginPromise = httpPostLogin$.toPromise();
        httpPostLoginPromise.then(()=>{
          const loginStatusRequestPromise = this.getLoginStatus();
          loginStatusRequestPromise.then(resolve);
          loginStatusRequestPromise.catch(reject);
        });
        httpPostLoginPromise.catch(reject);
      });

  }
}
