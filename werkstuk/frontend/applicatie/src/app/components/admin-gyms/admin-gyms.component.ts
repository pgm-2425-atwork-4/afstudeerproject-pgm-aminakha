import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-gyms',
  standalone: true,
  imports: [FormsModule, RouterLink,CommonModule],
  templateUrl: './admin-gyms.component.html',
  styleUrls: ['./admin-gyms.component.css'],
})
export class AdminGymsComponent implements OnInit {
  gyms: any[] = [];
  editingGym: any = null;
  gymName: string = '';
  city: string = '';
  rating: string = '';
  openingHours: string = '';
  address: string = '';
  email: string = '';
  phone: string = ''; 
  website: string = '';
  selectedLogoFile: File | null = null;
  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadGyms();
  }

  // Load gyms from the API
  loadGyms() {
    this.apiService.getGyms().subscribe({
      next: (data) => {
        this.gyms = data;
      },
      error: (error) => {
        console.error('🔥 Error fetching gyms:', error);
      },
    });
  }

  // Start editing a gym
  startEdit(gym: any) {
    this.editingGym = { ...gym }; // Create a copy of the gym to edit
  }

  // Cancel editing and reset the form
  cancelEdit() {
    this.editingGym = null;
  }

  // Update the gym details
  updateGym() {
    if (!this.editingGym) return;
  
    const formData = new FormData();
    formData.append('name', this.editingGym.name);
    formData.append('city', this.editingGym.city);
    formData.append('rating', this.editingGym.rating);
    formData.append('opening_hours', this.editingGym.opening_hours);
    formData.append('address', this.editingGym.address || '');
    formData.append('email', this.editingGym.email || '');
    formData.append('phone', this.editingGym.phone || '');
    formData.append('website', this.editingGym.website || '');
  
    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }
  
    formData.forEach((value, key) => {
      console.log(`📝 ${key}:`, value);
    });
  
    this.apiService.updateGym(this.editingGym.id, formData).subscribe({
      next: () => {
        alert('✅ Gym updated!');
        this.editingGym = null;
        this.loadGyms();
      },
      error: (err) => {
        console.error('🔥 Error updating gym:', err);
        alert('Error updating gym.');
      },
    });
  }

  // Delete a gym
  deleteGym(id: number) {
    if (confirm('Are you sure you want to delete this gym?')) {
      this.apiService.deleteGym(id).subscribe({
        next: () => {
          alert('✅ Gym deleted!');
          this.loadGyms();
        },
        error: (err) => {
          console.error('🔥 Error deleting gym:', err);
          alert('Error deleting gym.');
        },
      });
    }
  }
}
