import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroHomeComponent } from '../../components/hero-home/hero-home.component';
import { AdminCategoryComponent } from '../../components/admin-category/admin-category.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeroHomeComponent, AdminCategoryComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {}
