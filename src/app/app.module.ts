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
    {provide: BET_TOKEN_ADDRESS, useValue: '0xFd45b41DE13DA901e94a8Fa83Cb60651cEd4c948'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
