import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
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
})
export class AppComponent implements OnInit {
  newBet: Partial<Bet> = {};
  account: string;
  openedBet: number = undefined;
  creatingBet: boolean;
  token: Token;
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
}
