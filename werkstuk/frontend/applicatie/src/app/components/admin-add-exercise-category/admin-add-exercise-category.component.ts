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
    form = new FormGroup({
      name: new FormControl('', Validators.required),
    });

  constructor(private exerciseService: ExerciseService) {}
  addCategory() {
    this.exerciseService.getExerciseCategories().subscribe({
      next: (response) => {
        alert('Category added successfully');
      },
      error: (err) => {
        console.error("🔥 Error adding category:", err);
        alert('Failed to add category');
      }
    });
  }
}
