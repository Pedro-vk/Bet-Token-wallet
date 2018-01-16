import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import blockies = require('blockies');

import { BetTokenService, Token, Bet, connectionStatus } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('easeInOut', [
      transition(':enter', [
        style({opacity: 0}),
        animate('.3s ease-in-out', style({opacity: 1})),
      ]),
      transition(':leave', [
        style({opacity: 1}),
        animate('.3s ease-in-out', style({opacity: 0})),
      ])
    ])
  ],
})
export class AppComponent implements OnInit {
  newBet: Partial<Bet> = {};
  account: string;
  openedBet: number = undefined;
  creatingBet: boolean;
  token: Token;
  clickedInstallMetaMask: boolean;
  connected$: Observable<connectionStatus>;
  balance$: Observable<number>;
  availableBalance$: Observable<number>;
  debt$: Observable<number>;
  myBets$: Observable<Bet[]>;
  @ViewChild('newBetForm') newBetForm: NgForm;

  constructor(private betTokenService: BetTokenService, private domSanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.connected$ = this.betTokenService.connectedChange;
    this.balance$ = this.betTokenService.getBalanceChanges();
    this.debt$ = this.betTokenService.getDebtChanges();
    this.myBets$ = this.betTokenService.getMyBetsChanges().map((bets: Bet[] = []) => bets.reverse());
    this.availableBalance$ = this.betTokenService.getAvailableBalanceChanges();

    this.betTokenService
      .getToken()
      .subscribe(token => this.token = token);

    this.betTokenService
      .getAccountChanges()
      .subscribe(account => this.account = account);
  }

  getImageOf(account: string = ''): SafeStyle {
    return this.domSanitizer.bypassSecurityTrustStyle(
      `url(${blockies({seed: account.toLowerCase(), size: 8, scale: 8}).toDataURL()})`,
    );
  }

  dripToMe(): void {
    this.betTokenService
      .dripToMe()
      .subscribe();
  }

  createBet(): void {
    const {against, amount, bet} = this.newBet;
    this.betTokenService
      .createBet(against, amount, bet)
      .subscribe(
        () => {
          this.newBetForm.reset();
          this.creatingBet = false;
        },
        () => this.creatingBet = false,
      );
    this.creatingBet = true;
  }

  accept(bet: Bet, accept: boolean): void {
    this.betTokenService
      .acceptBet(bet.id, accept)
      .subscribe();
  }
  giveMeTheMoney(bet: Bet): void {
    this.betTokenService
      .giveMeTheMoney(bet.id)
      .subscribe();
  }
  cryAndForgotBet(bet: Bet): void {
    this.betTokenService
      .cryAndForgotBet(bet.id)
      .subscribe();
  }

  trackBet(index: number, bet: Bet): string {
    return String(bet.id) || '';
  }

  reload(): void {
    window.location.reload();
  }
}
