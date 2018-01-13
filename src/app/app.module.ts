import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { PROVIDERS, BET_TOKEN_ADDRESS } from './shared';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    PROVIDERS,
    {provide: BET_TOKEN_ADDRESS, useValue: '0x4799e0DE6172B86647E85F842DD399937FB9ABfE'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
