import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-add-gym',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Add FormsModule here
  templateUrl: './admin-add-gym.component.html',
  styleUrls: ['./admin-add-gym.component.css']
})
export class AdminAddGymComponent implements OnInit {
  gymData: any = {
    name: '',
    city: '',
    rating: '',
    opening_hours: '',
    address: '',
    personal_trainer: false,
    pressure_id: '',
    category_id: '',
    pricing_id: '',
    province_id: '',
  };

  selectedLogo: File | null = null;
  selectedImages: File[] = [];

  // ✅ Dropdown Data
  pressures: any[] = [];
  categories: any[] = [];
  pricingPlans: any[] = [];
  provinces: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // ✅ Fetch Dropdown Options
    this.apiService.getPressureTypes().subscribe((data: any) => this.pressures = data);
    this.apiService.getCategories().subscribe((data: any) => this.categories = data);
    this.apiService.getPricingPlans().subscribe((data: any) => this.pricingPlans = data);
    this.apiService.getProvinces().subscribe((data: any) => this.provinces = data);
  }

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

    // ✅ Append selected IDs
    formData.append('pressure_id', this.gymData.pressure_id);
    formData.append('category_id', this.gymData.category_id);
    formData.append('pricing_id', this.gymData.pricing_id);
    formData.append('province_id', this.gymData.province_id);

    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }

    this.selectedImages.forEach((file) => {
      formData.append('images', file);
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
