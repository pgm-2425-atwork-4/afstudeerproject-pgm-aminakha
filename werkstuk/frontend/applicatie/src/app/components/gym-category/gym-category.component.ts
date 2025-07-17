import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MetaDataService } from '../../services/meta-data.service';

@Component({
  selector: 'app-gym-category',
  standalone: true, 
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './gym-category.component.html',
  styleUrls: ['./gym-category.component.css'],
  providers: [MetaDataService]
})
export class GymCategoryComponent implements OnInit {
  categories: any[] = [];

  constructor(private metaDataService: MetaDataService) {} 

  ngOnInit() {
    this.metaDataService.getCategories().subscribe({
      next: (data) => {
        console.log("✅ Categories received:", data);
        this.categories = Array.isArray(data) ? data : Object.values(data); 
      },
      error: (error) => {
        console.error("❌ Error fetching categories:", error);
      }
    });
  }
}
