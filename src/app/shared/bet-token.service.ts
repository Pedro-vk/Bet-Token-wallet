import { Injectable, InjectionToken, Inject } from '@angular/core';
import * as Web3 from 'web3';
import { Contract } from 'web3/types';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';

import { betTokenInterface } from './bet-token.config';

export const BET_TOKEN_ADDRESS = new InjectionToken('BET_TOKEN_ADDRESS');

@Injectable()
export class BetTokenService {
  account: string;
  private _connected = false;
  private web3: Web3;

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
      console.log(this.web3);
      console.log(this.getContract())
      this.createBet('0x57D2D793efd81cB76AF623249920Cc5Bd35EBBa9', 1, 'Test 1').subscribe(console.log.bind(console))
    }
  }

  private getContract(): Contract {
    return new this.web3.eth.Contract(betTokenInterface, this.betTokenAddress);
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

  dripToMe(): Observable<undefined> {
    return Observable.fromPromise(this.getContract().methods.dripToMe().call());
  }

  createBet(to: string, amount: number, bet: string): Observable<undefined> {
    return this.getAccont()
      .mergeMap(from =>
        Observable.fromPromise(this.getContract().methods.bet(to, amount, bet).send({from})),
      );
  }

}
