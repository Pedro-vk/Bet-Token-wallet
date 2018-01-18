import { Injectable, InjectionToken, Inject } from '@angular/core';
import Web3 = require('web3');
import { Contract, Transaction } from 'web3/types';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/empty';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/interval';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/take';

import { betTokenInterface } from './bet-token.config';

export const BET_TOKEN_ADDRESS = new InjectionToken('BET_TOKEN_ADDRESS');
export const BET_TOKEN_NETWORK = new InjectionToken('BET_TOKEN_NETWORK');

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

export type connectionStatus = 'total' | 'no-account' | 'no-provider' | 'no-network' | 'no-ether';

@Injectable()
export class BetTokenService {
  account: string;
  private _connectedChange: Subject<connectionStatus> = new Subject();
  connectedChange$: Observable<connectionStatus> = this._connectedChange.distinctUntilChanged().share();
  private _connected: connectionStatus = undefined;
  private events$: Subject<{event: string, response: any}> = new Subject();
  private newSend$: Subject<undefined> = new Subject();
  private defaultTimer$: Observable<any>;
  private web3: Web3;
  private contract: Contract;

  get connected(): connectionStatus {
    return this._connected;
  }

  constructor(
    @Inject(BET_TOKEN_ADDRESS) private betTokenAddress: string,
    @Inject(BET_TOKEN_NETWORK) private betTokenNetwork: string,
  ) {
    this.initWeb3();
    this.defaultTimer$ = Observable
      .interval(100)
      .startWith(undefined)
      .mergeMap(() => this.getBlockNumber())
      .distinctUntilChanged()
      .share();
    this.checkData()
      .filter(() => (<any>window).web3 && (<any>window).web3.currentProvider)
      .take(1)
      .subscribe(() => this.initWeb3());
    this.connectedChange$
      .filter(status => status === 'total')
      .mergeMap(() => this.getAccount())
      .subscribe(account => {
        this.web3.eth.defaultAccount = account;
      });
    this.checkData()
      .mergeMap(() => this.getAccount())
      .distinctUntilChanged()
      .combineLatest(
        this.isNetwork().startWith(true),
        this.getEthBalanceChanges().startWith(Infinity),
      )
      .subscribe(([account, isNetwork, balance]) => {
        switch (account) {
          case undefined: this._connected = 'no-provider'; break;
          case '': this._connected = 'no-account'; break;
          default: this._connected = 'total'; break;
        }
        if (!isNetwork) {
          this._connected = 'no-network';
        } else if (this._connected === 'total' && !balance) {
          this._connected = 'no-ether';
        }
        this._connectedChange.next(this._connected);
      });
  }

  private initWeb3(): void {
    if (!this.web3 && (<any>window).web3) {
      this.web3 = new Web3((<any>window).web3.currentProvider);
    }
  }

  getBlockNumber(): Observable<number> {
    if (this.web3) {
      return Observable.fromPromise(this.web3.eth.getBlockNumber());
    }
    return Observable.empty();
  }

  getNetwork(): Observable<string> {
    if (this.web3) {
      return Observable.fromPromise((<any>this.web3.eth.net).getNetworkType());
    }
    return Observable.empty();
  }

  private isNetwork(): Observable<boolean> {
    return this.getNetwork()
      .map(network => network === this.betTokenNetwork);
  }

  private getRawContract(): Contract {
    if (!this.web3) {
      return;
    }
    if (!this.contract) {
      this.contract = new this.web3.eth.Contract(betTokenInterface, this.betTokenAddress);
    }
    return this.contract;
  }

  private getContract(): Observable<Contract> {
    return this.isNetwork()
      .mergeMap(isNetwork => {
        if (!isNetwork) {
          return Observable.empty();
        }
        const contract = this.getRawContract();
        if (!contract) {
          return Observable.empty();
        }
        return Observable.of(contract);
      });
  }

  getAccount(): Observable<string> {
    if (!this.web3) {
      return Observable.of(undefined);
    }
    return Observable
      .fromPromise(this.web3.eth.getAccounts())
      .map(accounts => accounts[0] || '');
  }

  getEthBalance(): Observable<number> {
    if (!this.web3) {
      return Observable.of(undefined);
    }
    return this.getAccount()
      .mergeMap(account =>
        Observable.fromPromise(this.web3.eth.getBalance(account)),
      )
      .map(balance => +this.web3.utils.fromWei(balance, 'ether'));
  }

  getPendingTransactions(): Observable<Transaction[]> {
    return this.getAccount()
      .mergeMap(account =>
        Observable.fromPromise(this.web3.eth.getBlock('pending', true))
          .map(({transactions}) => transactions.filter(transaction => transaction.from === account)),
      );
  }

  getToken(): Observable<Token> {
    return this.getContract()
      .mergeMap(contract =>
        Observable
          .combineLatest(
            Observable.fromPromise(contract.methods.name().call()),
            Observable.fromPromise(contract.methods.symbol().call()),
            Observable.fromPromise(contract.methods.decimals().call()),
            Observable.fromPromise(contract.methods.version().call()),
            Observable.fromPromise(contract.methods.owner().call()),
            Observable.fromPromise(contract.methods.totalSupply().call()),
          )
          .map(([name, symbol, decimals, version, owner, totalSupply]) => ({name, symbol, decimals, version, owner, totalSupply})),
      );
  }

  getBalance(): Observable<number> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .mergeMap(([account, contract]) =>
        Observable.fromPromise(contract.methods.balanceOf(account).call()),
      )
      .map(number => +number);
  }

  getAvailableBalance(): Observable<number> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .mergeMap(([account, contract]) =>
        Observable.fromPromise(contract.methods.availableBalanceOf(account).call()),
      )
      .map(number => +number);
  }

  getDebt(): Observable<number> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .mergeMap(([account, contract]) =>
        Observable.fromPromise(contract.methods.debtOf(account).call()),
      )
      .map(number => +number);
  }

  dripToMe(): Observable<any> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .do(() => this.newSend$.next())
      .mergeMap(([from, contract]) =>
        Observable.fromPromise(contract.methods.dripToMe().send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  transfer(to: string, amount: number): Observable<any> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .do(() => this.newSend$.next())
      .mergeMap(([from, contract]) =>
        Observable.fromPromise(contract.methods.transfer(to, amount).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  createBet(against: string, amount: number, bet: string): Observable<any> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .do(() => this.newSend$.next())
      .mergeMap(([from, contract]) =>
        Observable.fromPromise(contract.methods.bet(against, amount, bet).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  acceptBet(bet: number, accept: boolean): Observable<any> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .do(() => this.newSend$.next())
      .mergeMap(([from, contract]) =>
        Observable.fromPromise(contract.methods.acceptBet(bet, accept).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  cryAndForgotBet(bet: number): Observable<any> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .do(() => this.newSend$.next())
      .mergeMap(([from, contract]) =>
        Observable.fromPromise(contract.methods.cryAndForgotBet(bet).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  giveMeTheMoney(bet: number): Observable<any> {
    return this.getAccount()
      .combineLatest(this.getContract())
      .do(() => this.newSend$.next())
      .mergeMap(([from, contract]) =>
        Observable.fromPromise(contract.methods.giveMeTheMoney(bet).send({from})),
      )
      .do(({events}) => this.onEvents(events));
  }

  getBetSize(): Observable<number> {
    return this.getContract()
      .mergeMap(contract =>
        Observable.fromPromise(contract.methods.betsSize().call()),
      )
      .map(size => +size);
  }

  getMyBets(): Observable<Bet[]> {
    return this.getAccount()
      .mergeMap((account: string = '') =>
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
    return this.getContract()
      .mergeMap(contract =>
        Observable.fromPromise(contract.methods.bets(bet).call()),
      )
      .map(_ => ({id: bet, ..._, amount: +_.amount}));
  }

  private onEvents(events: {[event: string]: any}): void {
    Object.entries(events)
      .map(([event, response]) => ({event, response}))
      .forEach(event => this.events$.next(event));
  }

  private checkData(...types: ('bet' | 'transaction' | 'send')[]): Observable<any> {
    // TODO: wait until MetaMask events support
    const triggers: Observable<any>[] = [];
    triggers.push(this.defaultTimer$);
    triggers.push(
      Observable.interval(100)
        .mergeMap(() => this.getAccount())
        .distinctUntilChanged(),
    );
    types
      .map(type => {
        switch (type) {
          case 'send': return this.newSend$;
          case 'bet': return this.events$.filter(({event}) => event === 'UpdateBet');
          case 'transaction': return this.events$.filter(({event}) => event === 'Transfer');
          default: return Observable.empty();
        }
      })
      .forEach(observable => triggers.push(observable));
    return Observable.merge(...triggers).debounceTime(100);
  }

  getAccountChanges(): Observable<string> {
    return this.checkData()
      .mergeMap(() => this.getAccount())
      .distinctUntilChanged();
  }

  getEthBalanceChanges(): Observable<number> {
    return this.checkData('bet', 'transaction')
      .mergeMap(() => this.getEthBalance())
      .distinctUntilChanged();
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

  getPendingTransactionsChanges(): Observable<Transaction[]> {
    const hash = (transactions: Transaction[]) => transactions.map(_ => _.hash).sort().join(',');
    return Observable
      .merge(
        this.checkData('send', 'bet', 'transaction'),
        Observable.interval(3000),
      )
      .mergeMap(() => this.getPendingTransactions())
      .distinctUntilChanged((a, b) => hash(a) === hash(b));
  }
}
