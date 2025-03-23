import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-gyms',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-gyms.component.html',
  styleUrls: ['./admin-gyms.component.css'],
})
export class AdminGymsComponent implements OnInit {
  gyms: any[] = [];
  editingGym: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadGyms();
  }

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

  startEdit(gym: any) {
    this.editingGym = { ...gym }; // shallow copy
  }

  cancelEdit() {
    this.editingGym = null;
  }

  updateGym() {
    const formData = new FormData();
    formData.append('name', this.editingGym.name);
    formData.append('city', this.editingGym.city);
    formData.append('rating', this.editingGym.rating.toString());
    formData.append('opening_hours', this.editingGym.opening_hours);

    // Optional: add other fields like address, contact, etc.

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
