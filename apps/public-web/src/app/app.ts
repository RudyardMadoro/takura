import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { isNonProduction, PUBLIC_SITE_MODE } from './site-mode';

@Component({
  imports: [RouterLink, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly siteMode = inject(PUBLIC_SITE_MODE);
  readonly nonProduction = isNonProduction(this.siteMode);
}
