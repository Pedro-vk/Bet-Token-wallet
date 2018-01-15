import { TestBed, inject } from '@angular/core/testing';

import { BetTokenService, BET_TOKEN_ADDRESS } from './bet-token.service';

describe('BetTokenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BetTokenService,
        {provide: BET_TOKEN_ADDRESS, useValue: '0x0000000000000000000000000000000000000000'},
      ],
    });
  });

  it('should be created', inject([BetTokenService], (service: BetTokenService) => {
    expect(service).toBeTruthy();
  }));
});
