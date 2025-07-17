import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetaDataService } from '../../services/meta-data.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css'],
})
export class AdminCategoryComponent implements OnInit {
  categoryName: string = '';
  selectedFile: File | null = null;
  categories: any[] = [];
  editingCategory: any = null;

  constructor(private metaDataService: MetaDataService, private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.metaDataService.getCategories().subscribe(
      (data) => (this.categories = data),
      (error) => console.error('❌ Error loading categories:', error)
    );
  }

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

    this.categoryService.uploadCategory(formData).subscribe(
      (response) => {
        console.log('✅ Category added successfully:', response);
        alert('Category added successfully!');
        this.resetForm();
        this.loadCategories();
      },
      (error) => {
        console.error('🔥 Error adding category:', error);
        alert('Error adding category. Please try again.');
      }
    );
  }

  editCategory(category: any) {
    this.editingCategory = { ...category };
    this.categoryName = category.name;
  }

  updateCategory() {
    if (!this.editingCategory) return;

    const formData = new FormData();
    formData.append('name', this.categoryName);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.categoryService.updateCategory(this.editingCategory.id, formData).subscribe(
      () => {
        alert('✅ Category updated!');
        this.resetForm();
        this.loadCategories();
      },
      (err) => {
        console.error('🔥 Error updating category:', err);
        alert('Error updating category');
      }
    );
  }

  deleteCategory(id: number) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe(
        () => {
          alert('✅ Category deleted!');
          this.loadCategories();
        },
        (err) => {
          console.error('🔥 Error deleting category:', err);
          alert('Error deleting category');
        }
      );
    }
  }

  resetForm() {
    this.categoryName = '';
    this.selectedFile = null;
    this.editingCategory = null;
  }
}
