import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GymService } from '../../services/gym.service';

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
  constructor(private gymService: GymService) {}

  ngOnInit() {
    this.loadGyms();
  }

  loadGyms() {
    this.gymService.getGyms().subscribe({
      next: (data: any) => {
        this.gyms = data;
      },
      error: (error) => {
        console.error('🔥 Error fetching gyms:', error);
      },
    });
  }

  startEdit(gym: any) {
    this.editingGym = { ...gym };
  }

  cancelEdit() {
    this.editingGym = null;
  }

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
  
    this.gymService.updateGym(this.editingGym.id, formData).subscribe({
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

  deleteGym(id: number) {
    if (confirm('Are you sure you want to delete this gym?')) {
      this.gymService.deleteGym(id).subscribe({
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
