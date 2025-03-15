import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GymCategoryComponent } from '../gym-category/gym-category.component';
@Component({
  selector: 'app-hero-home',
  imports: [GymCategoryComponent],
  templateUrl: './hero-home.component.html',
  styleUrl: './hero-home.component.css'
})
export class HeroHomeComponent {
  searchSvg: string = '/afstudeerproject-pgm-aminakha/images//images/search.svg';
}
