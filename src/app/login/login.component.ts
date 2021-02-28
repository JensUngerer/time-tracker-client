import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { tap } from 'rxjs/internal/operators/tap';
import { environment } from 'src/environments/environment';
import { AuthentificationService, ILoginStatus } from '../authentification.service';
import { CommitService } from '../commit.service';
import { RoutingRoutes } from '../routing-routes';

@Component({
  selector: 'mtt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  private readonly DELAY = 5 * 1000;
  private authentificationExpressOptions: any;
  isVisible = false;

  ngFormGroup: FormGroup;
  userNameFormControlName = 'userName';
  passwordFormControlname = 'password';

  constructor(private formBuilder: FormBuilder,
    private authentificationService: AuthentificationService,
    private router: Router) {
      // this.authentificationExpressOptions = {... CommitService.httpOptions};
      // this.authentificationExpressOptions.withCredentials = true;
      // {
      //  withCredentials: true
      // }

     }

  ngOnInit(): void {
    // const formGroupConfig: {[key: string]: AbstractControl} = {};
    // formGroupConfig[this.userNameFormControlName] = ['', Validators.required, Validators.minLength(2)];
    // formGroupConfig[this.passwordFormControlname] = new FormControl('', [Validators.required, Validators.minLength(2)]);

    // this.ngFormGroup = new FormGroup(formGroupConfig);
    const group = {};
    group[this.userNameFormControlName] = '';
    group [this.passwordFormControlname] = '';
    this.ngFormGroup = this.formBuilder.group(group)
    this.ngFormGroup.controls[this.userNameFormControlName].setValidators([Validators.required, Validators.minLength(1)]);
    this.ngFormGroup.controls[this.passwordFormControlname].setValidators([Validators.required, Validators.minLength(1)]);
  }

  ngAfterViewInit(): void {
    this.fireIsVisibleWithDelay();
  }

  private fireIsVisibleWithDelay() {
    this.isVisible = false;
    setTimeout(() => {
      this.isVisible = true;
    }, this.DELAY);
  }

  // private generateUrl(urlPostfix: string) {
  //   return environment.httpBaseUrl + environment.port + urlPostfix;
  // }

  submit(values:  {[key: string]: string}) {
    this.ngFormGroup.reset();
    this.fireIsVisibleWithDelay();
    // console.log()
    let userName = values[this.userNameFormControlName];
    let password = values[this.passwordFormControlname];
    password = CryptoJS.SHA512(password).toString();

    const loginStatusPromise = this.authentificationService.login(userName, password);
    loginStatusPromise.then((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        const routerPromise = this.router.navigate([RoutingRoutes.routeAfterSuccesfulLogin]);
        routerPromise.then((isSuccessful: boolean) => {
          if (isSuccessful) {
            window.location.reload();
          } else  {
            console.error('page refresh failed');
          }
        });
      } else {
        console.error(JSON.stringify(isLoggedIn, null, 4));
      }
    });

   
    // console.log(JSON.stringify({
    //   userName,
    //   password
    // }, null, 4));
    
  }

  // private requestLoginStatus() {
  //   const loginStatusUrl = this.generateUrl('/api/login-status');
  //   const httpGetLoginStatus$ = this.httpClient.get(loginStatusUrl, CommitService.httpOptions);
  //   httpGetLoginStatus$.pipe(tap(this.printLoginStatus.bind(this))).subscribe();
  // }

  // private printLoginStatus(loginStatus: any) {
  //   console.log(JSON.parse(loginStatus));
  // }

  userNameChanged(){
    // console.log(this.ngFormGroup.controls[this.userNameFormControlName].valid);
    // console.log('done');
  }

  logout() {
  }
}
