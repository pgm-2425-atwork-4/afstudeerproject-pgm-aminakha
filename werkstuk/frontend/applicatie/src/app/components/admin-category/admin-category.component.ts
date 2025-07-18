import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MetaDataService } from '../../services/meta-data.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css'],
})
export class AdminCategoryComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    image: new FormControl<File | null>(null)
  });

  image: File | null = null;
  categories: any[] = [];
  editingCategory: any = null;

  constructor(
    private metaDataService: MetaDataService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.metaDataService.getCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('❌ Error loading categories:', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.image = file;
      this.form.patchValue({ image: file });
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.image) {
      alert('❗ Vul alle velden in en kies een afbeelding.');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name || '');
    formData.append('image', this.image);

    this.categoryService.uploadCategory(formData).subscribe({
      next: () => {
        alert('✅ Categorie toegevoegd!');
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        console.error('🔥 Fout bij toevoegen categorie:', err);
        alert('Fout bij toevoegen.');
      }
    });
  }

  editCategory(category: any) {
    this.editingCategory = { ...category };
    this.form.patchValue({ name: category.name });
    this.image = null;
  }

  updateCategory() {
    if (!this.editingCategory) return;

    const formData = new FormData();
    formData.append('name', this.form.value.name || '');
    if (this.image) {
      formData.append('image', this.image);
    }

    this.categoryService.updateCategory(this.editingCategory.id, formData).subscribe({
      next: () => {
        alert('✅ Categorie geüpdatet!');
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        console.error('🔥 Fout bij updaten categorie:', err);
        alert('Updaten mislukt.');
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          alert('✅ Categorie verwijderd!');
          this.loadCategories();
        },
        error: (err) => {
          console.error('🔥 Fout bij verwijderen:', err);
          alert('Verwijderen mislukt.');
        }
      });
    }
  }

  resetForm() {
    this.form.reset();
    this.image = null;
    this.editingCategory = null;
  }
}
