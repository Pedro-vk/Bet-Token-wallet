import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import { Transaction } from 'web3/types';
import blockies = require('blockies');

import { BetTokenService, Token, Bet, connectionStatus, BET_TOKEN_NETWORK } from './shared';

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
  network: string;
  openedBet: number = undefined;
  creatingBet: boolean;
  token: Token;
  clickedInstallMetaMask: boolean;
  connected$: Observable<connectionStatus>;
  ethBalance$: Observable<number>;
  balance$: Observable<number>;
  availableBalance$: Observable<number>;
  debt$: Observable<number>;
  myBets$: Observable<Bet[]>;
  pendingTransactions$: Observable<Transaction[]>;
  @ViewChild('newBetForm') newBetForm: NgForm;

  constructor(
    @Inject(BET_TOKEN_NETWORK) public betTokenNetwork: string,
    private betTokenService: BetTokenService,
    private http: Http,
    private domSanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.connected$ = this.betTokenService.connectedChange$;
    this.ethBalance$ = this.betTokenService.getEthBalanceChanges();
    this.balance$ = this.betTokenService.getBalanceChanges();
    this.debt$ = this.betTokenService.getDebtChanges();
    this.myBets$ = this.betTokenService.getMyBetsChanges().map((bets: Bet[] = []) => bets.reverse());
    this.availableBalance$ = this.betTokenService.getAvailableBalanceChanges();
    this.pendingTransactions$ = this.betTokenService.getPendingTransactionsChanges();

    this.betTokenService
      .getToken()
      .subscribe(token => this.token = token);

    this.betTokenService
      .getAccountChanges()
      .subscribe(account => this.account = account);

    this.betTokenService
      .getEthBalanceChanges()
      .filter(balance => balance === 0)
      .mergeMap(() => this.betTokenService.getAccount())
      .distinctUntilChanged()
      .mergeMap(account =>
        this.betTokenService
          .getNetwork()
          .filter(network => network === 'ropsten')
          .map(() => account),
      )
      .subscribe(account => this.claimTestEtherOnRopsten(account));
  }

  claimTestEtherOnRopsten(account: string): void {
    console.log('Donete to ', account);
    this.http.get(`http://faucet.ropsten.be:3001/donate/${account}`)
      .subscribe(() => console.log('Donation done!'));
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

  trackTransaction(index: number, tx: Transaction): string {
    return String(tx.hash) || '';
  }

  reload(): void {
    window.location.reload();
  }
}
