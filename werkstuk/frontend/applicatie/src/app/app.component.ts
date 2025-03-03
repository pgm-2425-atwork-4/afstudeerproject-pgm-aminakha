import { Component } from '@angular/core';
import { GymCategoryComponent } from './components/gym-category/gym-category.component';
import {HeaderComponent} from './header/header.component';
import { RouterModule } from '@angular/router'; // ✅ Import RouterModule
import { AdminCategoryComponent } from './components/admin-category/admin-category.component';
import { HeroHomeComponent } from './components/hero-home/hero-home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GymCategoryComponent, HeaderComponent,RouterModule,AdminCategoryComponent,HeroHomeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
