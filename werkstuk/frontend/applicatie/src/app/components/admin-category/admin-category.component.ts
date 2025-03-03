import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Ensure FormsModule is imported
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css'],
})
export class AdminCategoryComponent {
  category = { name: '', image_url: '' };

  constructor(private uploadService: UploadService) {}

  onSubmit() {
    console.log("🚀 Sending Data:", this.category); // ✅ Debug Log

    if (!this.category.name || !this.category.image_url) {
      alert('Please provide both a category name and an image URL.');
      return;
    }

    this.uploadService.addCategory(this.category).subscribe(
      (response) => {
        console.log('✅ Category added successfully:', response);
        alert('Category added successfully!');
        this.category = { name: '', image_url: '' }; // ✅ Reset form
      },
      (error) => {
        console.error('🔥 Error adding category:', error);
        alert('Error adding category. Please try again.');
      }
    );
  }
}
