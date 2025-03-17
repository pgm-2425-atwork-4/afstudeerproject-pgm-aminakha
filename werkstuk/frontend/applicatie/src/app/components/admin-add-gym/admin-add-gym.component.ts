import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule for ngModel
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-add-gym',
  standalone: true, // ✅ Ensure standalone component
  imports: [CommonModule, FormsModule], // ✅ Include FormsModule here
  templateUrl: './admin-add-gym.component.html',
  styleUrls: ['./admin-add-gym.component.css']
})
export class AdminAddGymComponent {
  gymData: any = {
    name: '',
    city: '',
    rating: '',
    opening_hours: '',
    address: '',
    personal_trainer: false,
  };

  selectedLogo: File | null = null;
  selectedImages: File[] = [];

  constructor(private apiService: ApiService) {}

  onLogoSelected(event: any) {
    this.selectedLogo = event.target.files[0];
  }

  onImagesSelected(event: any) {
    this.selectedImages = Array.from(event.target.files);
  }

  addGym() {
    const formData = new FormData();
    Object.keys(this.gymData).forEach(key => {
      formData.append(key, this.gymData[key]);
    });

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    this.selectedImages.forEach(file => {
      formData.append('images', file);
    });

    this.apiService.addGym(formData).subscribe({
      next: res => {
        console.log("✅ Gym Added:", res);
        alert("Gym added successfully!");
      },
      error: err => {
        console.error("🔥 Error adding gym:", err);
        alert("Failed to add gym.");
      }
    });
  }
}
