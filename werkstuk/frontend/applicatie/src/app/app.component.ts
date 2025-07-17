import { Component } from '@angular/core';
import {HeaderComponent} from './header/header.component';
import { RouterModule } from '@angular/router'; 
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HeaderComponent,FooterComponent,CommonModule,RouterOutlet ], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor() {}
  ngOnInit() {
 
  }
}
