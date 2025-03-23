import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
    video: File | null;
  } = {
    name: '',
    exerciseCategory_id: null,
    pressure_id: null,
    big_description: '',
    image: null,
    video: null
  };

  categories: any[] = []; // For storing exercise categories
  pressures: any[] = []; // For storing pressure categories

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Fetch categories and pressures when component is initialized
    this.apiService.getExerciseCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
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

  // Method for handling image file selection
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.exercise.image = file;  // Set the selected file as the image
      console.log('Image selected:', file);
    }
  }

  // Method for handling video file selection
  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.exercise.video = file;  // Set the selected file as the video
      console.log('Video selected:', file);
    }
  }

  addExercise() {
    const formData = new FormData();
  
    // Check if the values are not null or undefined, if they are, provide a default value
    formData.append('name', this.exercise.name);
    formData.append('exerciseCategory_id', (this.exercise.exerciseCategory_id ?? 'default_value').toString());
    formData.append('pressure_id', (this.exercise.pressure_id ?? 'default_value').toString());
    formData.append('big_description', this.exercise.big_description);
  
    // Add files if selected
    if (this.exercise.image) {
      formData.append('image', this.exercise.image);
    }
  
    if (this.exercise.video) {
      formData.append('video', this.exercise.video);
    }
  
    // Make the request to add exercise
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
