import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-admin-add-exercise-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-add-exercise-category.component.html',
  styleUrl: './admin-add-exercise-category.component.css'
})
export class AdminAddExerciseCategoryComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    image: new FormControl<File | null>(null)
  });

  selectedImage: File | null = null;
  exerciseCategories: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  editingCategory: any = null;

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories() {
    this.exerciseService.getExerciseCategories().subscribe({
      next: (data : any) => {
        this.exerciseCategories = data;
      },
      error: (err) => {
        console.error('Fout bij ophalen categorieën:', err);
      }
    });
  }

  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  addCategory() {
    if (this.form.invalid || !this.selectedImage) {
      this.errorMessage = 'Alle velden zijn verplicht.';
      return;
    }

    const formData = new FormData();
    formData.append('name', this.form.value.name ?? '');
    formData.append('image', this.selectedImage);

    this.exerciseService.addExerciseCategory(formData).subscribe({
      next: () => {
        this.successMessage = 'Categorie succesvol toegevoegd';
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        console.error("Fout bij toevoegen categorie:", err);
        this.errorMessage = 'Toevoegen mislukt';
      }
    });
  }

  editCategory(category: any) {
    this.editingCategory = { ...category };
    this.form.patchValue({ name: category.name });
    this.selectedImage = null;
  }

  updateCategory() {
    if (!this.editingCategory) return;

    const formData = new FormData();
    formData.append('name', this.form.value.name ?? '');
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.exerciseService.updateExerciseCategory(this.editingCategory.id, formData).subscribe({
      next: () => {
        this.successMessage = 'Categorie succesvol bijgewerkt';
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        console.error("Fout bij updaten categorie:", err);
        this.errorMessage = 'Updaten mislukt';
      }
    });
  }

  deleteCategory(id: number) {
    if (confirm('Weet je zeker dat je deze categorie wilt verwijderen?')) {
      this.exerciseService.deleteExerciseCategory(id).subscribe({
        next: () => {
          this.successMessage = 'Categorie succesvol verwijderd';
          this.loadCategories();
        },
        error: (err) => {
          console.error("Fout bij verwijderen categorie:", err);
          this.errorMessage = 'Verwijderen mislukt';
        }
      });
    }
  }

  resetForm() {
    this.form.reset();
    this.selectedImage = null;
    this.editingCategory = null;
    this.successMessage = '';
    this.errorMessage = '';
  }
}
