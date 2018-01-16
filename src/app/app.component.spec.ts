import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';

import { PROVIDERS, BET_TOKEN_ADDRESS } from './shared';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        NoopAnimationsModule,
        MatButtonModule,
        MatCardModule,
        MatExpansionModule,
        MatIconModule,
        MatInputModule,
        MatToolbarModule,
      ],
      declarations: [
        AppComponent,
      ],
      providers: [
        ...PROVIDERS,
        {provide: BET_TOKEN_ADDRESS, useValue: '0x0000000000000000000000000000000000000000'},
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
