import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { PROVIDERS, BET_TOKEN_ADDRESS, BET_TOKEN_NETWORK } from './shared';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpModule,
    BrowserAnimationsModule,

    AppRoutingModule,

    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatToolbarModule,
  ],
  providers: [
    ...PROVIDERS,
    {provide: BET_TOKEN_ADDRESS, useValue: '0x0de53e55EAb2aCBb84be28A7a3bEAEAc852afFdA'},
    {provide: BET_TOKEN_NETWORK, useValue: 'ropsten'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
