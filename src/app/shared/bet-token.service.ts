import { Injectable, InjectionToken, Inject } from '@angular/core';
import Web3 = require('web3');
import { Contract } from 'web3/types';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

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
  private _connected = false;
  private web3: Web3;
  private contract: Contract;

  get connected(): boolean {
    return this._connected;
  }

  constructor(@Inject(BET_TOKEN_ADDRESS) private betTokenAddress: string) {
    if (typeof (<any>window).web3 !== 'undefined') {
      this.web3 = new Web3((<any>window).web3.currentProvider);
      this.getAccont()
        .subscribe(account => {
          this.web3.eth.defaultAccount = account;
          this._connected = true;
        });
      console.log(this);
      console.log(this.web3);
      console.log(this.getContract());
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

  getAccont(): Observable<string> {
    return Observable.fromPromise(this.web3.eth.getCoinbase());
  }

  getBalance(): Observable<number> {
    return this.getAccont()
      .mergeMap(account =>
        Observable.fromPromise(this.getContract().methods.balanceOf(account).call()),
      );
  }

  getDebt(): Observable<number> {
    return this.getAccont()
      .mergeMap(account =>
        Observable.fromPromise(this.getContract().methods.debtOf(account).call()),
      );
  }

  dripToMe(): Observable<any> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.dripToMe().send({from})),
      );
  }

  transfer(to: string, amount: number): Observable<any> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.transfer(to, amount).send({from})),
      );
  }

  createBet(to: string, amount: number, bet: string): Observable<any> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.bet(to, amount, bet).send({from})),
      );
  }

  acceptBet(bet: number, accept: boolean): Observable<any> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.acceptBet(bet, accept).send({from})),
      );
  }

  cryAndForgotBet(bet: number): Observable<any> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.cryAndForgotBet(bet).send({from})),
      );
  }

  giveMeTheMoney(bet: number): Observable<any> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.giveMeTheMoney(bet).send({from})),
      );
  }

  getBetSize(): Observable<number> {
    return Observable.
      fromPromise(this.getContract().methods.betsSize().call())
      .map(size => +size);
  }

  getMyBets(): Observable<Bet[]> {
    return this.getAccont()
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
      .map(_ => ({id: bet, ..._}));
  }
}
