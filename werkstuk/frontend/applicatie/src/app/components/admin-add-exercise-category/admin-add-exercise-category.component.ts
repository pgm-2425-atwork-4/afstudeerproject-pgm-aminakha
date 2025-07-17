import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-admin-add-exercise-category',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-add-exercise-category.component.html',
  styleUrl: './admin-add-exercise-category.component.css'
})
export class AdminAddExerciseCategoryComponent {
  category = {
    name: ''
  };
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
