import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-admin-gyms',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-gyms.component.html',
  styleUrls: ['./admin-gyms.component.css'],
})
export class AdminGymsComponent implements OnInit {
  gyms: any[] = [];
  editingGym: any = null;
  selectedLogoFile: File | null = null;

  form: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    city: new FormControl('', Validators.required),
    rating: new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]),
    opening_hours: new FormControl('', Validators.required),
    address: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    website: new FormControl('')
  });

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

    this.form.patchValue({
      name: gym.name || '',
      city: gym.city || '',
      rating: gym.rating || '',
      opening_hours: gym.opening_hours || '',
      address: gym.address || '',
      email: gym.email || '',
      phone: gym.phone || '',
      website: gym.website || ''
    });
  }

  cancelEdit() {
    this.editingGym = null;
    this.form.reset();
    this.selectedLogoFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedLogoFile = file;
    }
  }

  updateGym() {
    if (!this.editingGym || this.form.invalid) return;

    const formData = new FormData();
    const data = this.form.value;

    formData.append('name', data.name || '');
    formData.append('city', data.city || '');
    formData.append('rating', data.rating || '');
    formData.append('opening_hours', data.opening_hours || '');
    formData.append('address', data.address || '');
    formData.append('email', data.email || '');
    formData.append('phone', data.phone || '');
    formData.append('website', data.website || '');

    if (this.selectedLogoFile) {
      formData.append('logo', this.selectedLogoFile);
    }

    this.gymService.updateGym(this.editingGym.id, formData).subscribe({
      next: () => {
        alert('✅ Gym updated!');
        this.cancelEdit();
        this.loadGyms();
      },
      error: (err) => {
        console.error('🔥 Error updating gym:', err);
        alert('Error updating gym.');
      }
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
