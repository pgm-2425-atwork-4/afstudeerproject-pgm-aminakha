import { Component } from '@angular/core';
import { Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {}

  ngOnInit() {
    // FIX voor scroll position restoration
    this.router.events
      .pipe(filter((e): e is Scroll => e instanceof Scroll))
      .subscribe((e: Scroll) => {
        if (e.position) {
          this.viewportScroller.scrollToPosition(e.position);
        } else {
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }
}
