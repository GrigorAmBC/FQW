import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';

import {SocialLoginModule, SocialAuthServiceConfig} from 'angularx-social-login';
import {
  GoogleLoginProvider,
} from 'angularx-social-login';
import {FormsModule} from "@angular/forms";
import {AppRoutingModule, routingComponents} from "./app-routing.module";

@NgModule({
  declarations: [
    routingComponents
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
})
export class AppModule {
}
