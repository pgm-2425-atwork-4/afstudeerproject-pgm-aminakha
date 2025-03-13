import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../services/api.service'; // ✅ Use ApiService instead of CategoryService

@Component({
  selector: 'app-gym-category',
  standalone: true, 
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './gym-category.component.html',
  styleUrls: ['./gym-category.component.css'],
  providers: [ApiService] // ✅ Ensure service is provided
})
export class GymCategoryComponent implements OnInit {
  categories: any[] = [];

  constructor(private apiService: ApiService) {} // ✅ Use ApiService

  ngOnInit() {
    console.log("📡 Fetching gym categories...");
    
    this.apiService.getCategories().subscribe({
      next: (data) => {
        console.log("✅ Categories received:", data);
        this.categories = Array.isArray(data) ? data : Object.values(data); // ✅ Ensure correct data format
      },
      error: (error) => {
        console.error("❌ Error fetching categories:", error);
      }
    });
  }
}
