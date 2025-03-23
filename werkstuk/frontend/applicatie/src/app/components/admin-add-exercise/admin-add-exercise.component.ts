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
export class AdminAddExerciseComponent {
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

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Fetch categories when component is initialized
    this.apiService.getExerciseCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error("🔥 Error fetching categories:", err);
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

    if (this.exercise.exerciseCategory_id !== null && this.exercise.exerciseCategory_id !== undefined) {
      formData.append('exerciseCategory_id', this.exercise.exerciseCategory_id.toString());
    } else {
      console.error("Exercise category ID is missing");
    }

    if (this.exercise.pressure_id !== null && this.exercise.pressure_id !== undefined) {
      formData.append('pressure_id', this.exercise.pressure_id.toString());
    } else {
      console.error("Pressure ID is missing");
    }

    formData.append('name', this.exercise.name);
    formData.append('big_description', this.exercise.big_description);

    // Check if the image exists before appending
    if (this.exercise.image) {
      formData.append('image', this.exercise.image);
    }

    // Check if the video exists before appending
    if (this.exercise.video) {
      formData.append('video', this.exercise.video);
    }

    // Call the API to add exercise
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