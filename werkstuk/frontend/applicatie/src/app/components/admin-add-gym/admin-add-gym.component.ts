import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Import FormsModule
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-add-gym',
  standalone: true,
  imports: [CommonModule, FormsModule], // ✅ Ensure FormsModule is included
  templateUrl: './admin-add-gym.component.html',
  styleUrls: ['./admin-add-gym.component.css'],
  providers: [ApiService]
})
export class AdminAddGymComponent {
  gymData = {
    name: '',
    city: '',
    rating: null,
    opening_hours: '',
    address: '',
    personal_trainer: false
  };

  constructor(private apiService: ApiService) {}

  addGym() {
    this.apiService.addGym(this.gymData).subscribe({
      next: (res) => {
        console.log("✅ Gym Added:", res);
      },
      error: (err) => {
        console.error("🔥 Error adding gym:", err);
      }
    });
  }
}
