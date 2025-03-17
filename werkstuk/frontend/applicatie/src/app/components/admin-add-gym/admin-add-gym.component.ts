import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-add-gym',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Add FormsModule to resolve `ngModel` issue
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

  constructor(private apiService: ApiService) {}

  // ✅ Handle Logo Selection
  onLogoSelected(event: any) {
    this.selectedLogo = event.target.files[0];
  }

  addGym() {
    const formData = new FormData();
    formData.append('name', this.gymData.name);
    formData.append('city', this.gymData.city);
    formData.append('rating', this.gymData.rating);
    formData.append('opening_hours', this.gymData.opening_hours);
    formData.append('address', this.gymData.address);
    formData.append('personal_trainer', this.gymData.personal_trainer ? '1' : '0');

    // ✅ Append logo file
    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

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
