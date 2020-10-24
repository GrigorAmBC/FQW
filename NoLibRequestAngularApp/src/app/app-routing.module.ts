import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MeetComponent} from "./meet/meet.component";
import {AppComponent} from "./app.component";

const routes: Routes = [
  // {path: '', component: MeetComponent},
  // {path: 'recognize', component: AppComponent}
]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [AppComponent, MeetComponent]