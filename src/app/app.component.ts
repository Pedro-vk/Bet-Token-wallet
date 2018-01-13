import { Component } from '@angular/core';

import { BetTokenService } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private betTokenService: BetTokenService) { }

}
