import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css'],
})
export class AdminCategoryComponent {
  categoryName: string = '';
  selectedFile: File | null = null;

  constructor(private uploadService: UploadService) {}

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (!this.categoryName || !this.selectedFile) {
      alert('Please provide a category name and select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.categoryName);
    formData.append('image', this.selectedFile);

    this.uploadService.uploadCategory(formData).subscribe(
      (response) => {
        console.log('✅ Category added successfully:', response);
        alert('Category added successfully!');
        this.categoryName = ''; 
        this.selectedFile = null;
      },
      (error) => {
        console.error('🔥 Error adding category:', error);
        alert('Error adding category. Please try again.');
      }
    );
  }
}

