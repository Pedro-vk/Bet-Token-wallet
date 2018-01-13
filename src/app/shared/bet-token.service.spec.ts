import { TestBed, inject } from '@angular/core/testing';

import { BetTokenService } from './bet-token.service';

describe('BetTokenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BetTokenService]
    });
  });

  it('should be created', inject([BetTokenService], (service: BetTokenService) => {
    expect(service).toBeTruthy();
  }));
});
