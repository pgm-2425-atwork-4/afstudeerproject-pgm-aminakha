import { Component } from '@angular/core';
import {HeaderComponent} from './header/header.component';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ HeaderComponent,CommonModule,RouterOutlet,RouterLink], // ✅ Ensure RouterModule is included
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
