import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule,
  ],
  providers: [
    ...PROVIDERS,
    {provide: BET_TOKEN_ADDRESS, useValue: '0x8a22124203251412b5242dbDe5838140C1D2a9e3'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
