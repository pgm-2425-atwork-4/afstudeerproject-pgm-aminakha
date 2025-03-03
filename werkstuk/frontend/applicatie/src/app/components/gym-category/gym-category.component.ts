import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-gym-category',
  standalone: true, // ✅ Ensure it's a standalone component
  imports: [CommonModule, HttpClientModule], // ✅ Import necessary modules
  templateUrl: './gym-category.component.html',
  styleUrls: ['./gym-category.component.css']
})
export class GymCategoryComponent implements OnInit {
  categories: any[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe(
      (data) => {
        this.categories = Object.values(data);
      },
      (error) => {
        console.error('🔥 Error fetching categories:', error);
      }
    );
  }
}
