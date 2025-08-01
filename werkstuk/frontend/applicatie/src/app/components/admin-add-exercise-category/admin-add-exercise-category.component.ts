import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-admin-add-exercise-category',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-add-exercise-category.component.html',
  styleUrl: './admin-add-exercise-category.component.css'
})
export class AdminAddExerciseCategoryComponent {
  successMessage: string = '';
  errorMessage: string = '';
    form = new FormGroup({
      name: new FormControl('', Validators.required),
      image: new FormControl<File | null>(null)
    });
    selectedImage: File | null = null;

  constructor(private exerciseService: ExerciseService) {}
  onImageSelected(event: any) {
    this.selectedImage = event.target.files[0];
  }

  addCategory() {
    const formData = new FormData();
    formData.append('name', this.form.value.name ?? '');

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.exerciseService.addExerciseCategory(formData).subscribe({
      next: (response) => {
        this.successMessage = 'Categorie succesvol toegevoegd';
      },
      error: (err) => {
        console.error("🔥 Fout bij het toevoegen van categorie:", err);
        this.errorMessage = 'Toevoegen van categorie mislukt';
      }
    });
  }
}
