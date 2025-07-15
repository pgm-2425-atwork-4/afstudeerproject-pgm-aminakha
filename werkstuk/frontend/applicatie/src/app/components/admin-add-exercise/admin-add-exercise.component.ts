import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-admin-add-exercise',
  templateUrl: './admin-add-exercise.component.html',
  styleUrls: ['./admin-add-exercise.component.css'],
  imports: [CommonModule, FormsModule]
})
export class AdminAddExerciseComponent implements OnInit {
  exercise: {
    name: string;
    exerciseCategory_id: string | number | null;
    pressure_id: string | number | null;
    big_description: string;
    image: File | null;
  } = {
    name: '',
    exerciseCategory_id: null,
    pressure_id: null,
    big_description: '',
    image: null
  };

  categories: any[] = []; 
  pressures: any[] = []; 

  constructor(private apiService: ApiService, private exerciseService: ExerciseService) {}

  ngOnInit(): void {

    this.exerciseService.getExerciseCategories().subscribe({
      next: (categories) => {
        categories = categories;
      },
      error: (err) => {
        console.error("🔥 Error fetching categories:", err);
      }
    });

    this.apiService.getPressures().subscribe({
      next: (pressures) => {
        this.pressures = pressures;
      },
      error: (err) => {
        console.error("🔥 Error fetching pressures:", err);
      }
    });
  }

  
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.exercise.image = file; 
      console.log('Image selected:', file);
    }
  }

  addExercise() {
    const formData = new FormData();
  
    formData.append('name', this.exercise.name);
    formData.append('exerciseCategory_id', (this.exercise.exerciseCategory_id ?? 'default_value').toString());
    formData.append('pressure_id', (this.exercise.pressure_id ?? 'default_value').toString());
    formData.append('big_description', this.exercise.big_description);
  
    
    if (this.exercise.image) {
      formData.append('image', this.exercise.image);
    }
  
    this.apiService.addExercise(formData).subscribe({
      next: (response) => {
        alert('Exercise added successfully!');
      },
      error: (err) => {
        console.error("🔥 Error adding exercise:", err);
        alert('Failed to add exercise');
      }
    });
  }
}
