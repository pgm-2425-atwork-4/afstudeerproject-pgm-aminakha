import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-add-exercise',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-add-exercise.component.html',
  styleUrls: ['./admin-add-exercise.component.css']
})
export class AdminAddExerciseComponent {
  exercise = {
    name: '',
    exerciseCategory_id: null,
    pressure_id: '',
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

  // Handle file selection for image upload
  onImageSelected(event: any) {
    this.exercise.image = event.target.files[0]; // Assign the selected image file
  }

  // Handle file selection for video upload
  onVideoSelected(event: any) {
    this.exercise.video = event.target.files[0]; // Assign the selected video file to the video property
  }
  

  // Handle exercise addition
  addExercise() {
    const formData = new FormData();
  
    // Ensure values are strings or numbers and are valid
    formData.append('name', this.exercise.name);
    
    // Ensure exerciseCategory_id is a valid value
    if (this.exercise.exerciseCategory_id != null) {
      formData.append('exerciseCategory_id', String(this.exercise.exerciseCategory_id)); // Convert to string
    }
  
    formData.append('pressure_id', String(this.exercise.pressure_id)); // Ensure pressure_id is a string
    formData.append('big_description', this.exercise.big_description);
  
    // Handle image and video upload if selected
    if (this.exercise.image) {
      formData.append('image', this.exercise.image);
    }
  
    if (this.exercise.video) {
      formData.append('video', this.exercise.video);
    }
  
    // Make the API call to add the exercise
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
