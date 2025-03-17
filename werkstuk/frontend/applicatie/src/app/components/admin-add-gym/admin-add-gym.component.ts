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
    
    formData.append('name', this.gymData.name);
    formData.append('city', this.gymData.city);
    formData.append('rating', this.gymData.rating);
    formData.append('opening_hours', this.gymData.opening_hours);
    formData.append('address', this.gymData.address);
    formData.append('personal_trainer', this.gymData.personal_trainer ? '1' : '0');
  
    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo); // ✅ Upload Logo
    }
  
    this.selectedImages.forEach((file) => {
      formData.append('images', file); // ✅ Upload Multiple Images
    });
  
    this.apiService.addGym(formData).subscribe({
      next: (res) => {
        console.log('✅ Gym Added:', res);
        alert('Gym added successfully!');
      },
      error: (err) => {
        console.error('🔥 Error adding gym:', err);
        alert('Failed to add gym.');
      }
    });
  }
  
  
}
