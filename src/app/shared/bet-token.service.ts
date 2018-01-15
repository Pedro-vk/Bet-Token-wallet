import { Injectable, InjectionToken, Inject } from '@angular/core';
import Web3 = require('web3');
import { Contract } from 'web3/types';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/startWith';

import { betTokenInterface } from './bet-token.config';

export const BET_TOKEN_ADDRESS = new InjectionToken('BET_TOKEN_ADDRESS');

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  version: string;
  owner: string;
  totalSupply: number;
}

export interface Bet {
  id?: number;
  from: string;
  against: string;
  bet: string;
  date: number;
  amount: number;
  accepted: boolean;
  opened: boolean;
}

@Injectable()
export class BetTokenService {
  account: string;
  private _connected = undefined;
  private events: Subject<{event: string, response: any}> = new Subject();
  private web3: Web3;
  private contract: Contract;

  get connected(): boolean {
    return this._connected;
  }

  constructor(@Inject(BET_TOKEN_ADDRESS) private betTokenAddress: string) {
    if (typeof (<any>window).web3 !== 'undefined') {
      this.web3 = new Web3((<any>window).web3.currentProvider);
      this.getAccount()
        .subscribe(account => {
          this.web3.eth.defaultAccount = account;
          this._connected = true;
        });
      console.log(this);
      console.log(this.web3);
      console.log(this.getContract());
      this.events.subscribe(_ => console.log('event:', _));
    } else {
      this._connected = false;
    }
  }

  private getContract(): Contract {
    if (!this.contract) {
      this.contract = new this.web3.eth.Contract(betTokenInterface, this.betTokenAddress);
    }
    return this.contract;
  }

  getToken(): Observable<Token> {
    const contract = this.getContract();
    return Observable
      .combineLatest(
        Observable.fromPromise(contract.methods.name().call()),
        Observable.fromPromise(contract.methods.symbol().call()),
        Observable.fromPromise(contract.methods.decimals().call()),
        Observable.fromPromise(contract.methods.version().call()),
        Observable.fromPromise(contract.methods.owner().call()),
        Observable.fromPromise(contract.methods.totalSupply().call()),
      )
      .map(([name, symbol, decimals, version, owner, totalSupply]) => ({name, symbol, decimals, version, owner, totalSupply}));
  }

  getAccount(): Observable<string> {
    return Observable
      .fromPromise(this.web3.eth.getAccounts())
      .map(accounts => accounts[0]);
  }

  getBalance(): Observable<number> {
    return this.getAccount()
      .mergeMap(account =>
        Observable.fromPromise(this.getContract().methods.balanceOf(account).call()),
      )
      .map(number => +number);
  }

  getAvailableBalance(): Observable<number> {
    return this.getAccount()
      .mergeMap(account =>
        Observable.fromPromise(this.getContract().methods.availableBalanceOf(account).call()),
      )
      .map(number => +number);
  }

  getDebt(): Observable<number> {
    return this.getAccount()
      .mergeMap(account =>
        Observable.fromPromise(this.getContract().methods.debtOf(account).call()),
      )
      .map(number => +number);
  }

  dripToMe(): Observable<any> {
    return this.getAccount()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.dripToMe().send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  transfer(to: string, amount: number): Observable<any> {
    return this.getAccount()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.transfer(to, amount).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  createBet(against: string, amount: number, bet: string): Observable<any> {
    return this.getAccount()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.bet(against, amount, bet).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  acceptBet(bet: number, accept: boolean): Observable<any> {
    return this.getAccount()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.acceptBet(bet, accept).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  cryAndForgotBet(bet: number): Observable<any> {
    return this.getAccount()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.cryAndForgotBet(bet).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  giveMeTheMoney(bet: number): Observable<any> {
    return this.getAccount()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.giveMeTheMoney(bet).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  getBetSize(): Observable<number> {
    return Observable.
      fromPromise(this.getContract().methods.betsSize().call())
      .map(size => +size);
  }

  getMyBets(): Observable<Bet[]> {
    return this.getAccount()
      .mergeMap(account =>
        this.getBets()
          .map(bets => bets
            .filter(({from, against}) =>
              from.toLowerCase() === account.toLowerCase() || against.toLowerCase() === account.toLowerCase(),
            ),
          ),
      );
  }

  getBets(): Observable<Bet[]> {
    return this.getAllBets()
      .map(bets => bets.filter(bet => bet.opened));
  }

  getAllBets(): Observable<Bet[]> {
    return this.getBetSize()
      .mergeMap(size =>
        Observable
          .combineLatest(
            ...Array.from(new Array(size))
              .map((_, index) => this.getBet(index)),
          ),
      );
  }

  getBet(bet: number): Observable<Bet> {
    return Observable
      .fromPromise(this.getContract().methods.bets(bet).call())
      .map(_ => ({id: bet, ..._, amount: +_.amount}));
  }

  private onEvents(events: {[event: string]: any}): void {
    Object.entries(events)
      .map(([event, response]) => ({event, response}))
      .forEach(event => this.events.next(event));
  }

  private checkData(...types: ('bet' | 'transaction')[]): Observable<any> {
    // TODO: wait until MetaMask events support
    // return Observable.interval(2000).startWith(undefined);
    const triggers: Observable<any>[] = [];
    triggers.push(Observable.interval(2000).startWith(undefined));
    types
      .map(type => {
        switch (type) {
          case 'bet': return this.events.filter(({event}) => event === 'UpdateBet');
          case 'transaction': return this.events.filter(({event}) => event === 'Transfer');
          default: return Observable.empty();
        }
      })
      .forEach(observable => triggers.push(observable));
    return Observable.merge(...triggers).debounceTime(100);
  }

  getMyBetsChanges(): Observable<Bet[]> {
    return this.checkData('bet')
      .mergeMap(() => this.getMyBets())
      .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b));
  }

  getBalanceChanges(): Observable<number> {
    return this.checkData('transaction')
      .mergeMap(() => this.getBalance())
      .distinctUntilChanged();
  }

  getAvailableBalanceChanges(): Observable<number> {
    return this.checkData('bet', 'transaction')
      .mergeMap(() => this.getAvailableBalance())
      .distinctUntilChanged();
  }

  getDebtChanges(): Observable<number> {
    return this.checkData('bet', 'transaction')
      .mergeMap(() => this.getDebt())
      .distinctUntilChanged();
  }
}
