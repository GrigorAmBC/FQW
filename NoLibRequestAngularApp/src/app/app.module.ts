import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {HttpClientModule} from '@angular/common/http';

import {SocialLoginModule, SocialAuthServiceConfig} from 'angularx-social-login';
import {
  GoogleLoginProvider,
} from 'angularx-social-login';
import {FormsModule} from "@angular/forms";
import {AppRoutingModule, routingComponents} from "./app-routing.module";
import {MeetComponent} from "./components/meet/meet.component";
import {AppComponent} from "./components/main/app.component";
import { DocsComponent } from './components/docs/docs.component';

@NgModule({
  declarations: [
    AppComponent,
    MeetComponent,
    DocsComponent
    // routingComponents
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SocialLoginModule,
    FormsModule,
    AppRoutingModule,
  ],
  providers: [{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(
            '488169954951-ci2554if1a5ndjf7icd9l8b88uquc3id.apps.googleusercontent.com'
          ),
        }
      ],
    } as SocialAuthServiceConfig,
  }],
  bootstrap: [AppComponent]
  // bootstrap: [MeetComponent]
})
export class AppModule {
}
