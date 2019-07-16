import { RoutingRoutes } from './routing-routes';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot(RoutingRoutes.routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
