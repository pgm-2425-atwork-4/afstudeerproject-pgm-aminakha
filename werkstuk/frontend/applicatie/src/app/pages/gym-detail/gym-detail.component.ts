import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true, // ✅ If it's a standalone component
  selector: 'app-gym-detail',
  templateUrl: './gym-detail.component.html',
  styleUrls: ['./gym-detail.component.css'],
  imports: [CommonModule]
})
export class GymDetailComponent implements OnInit {
  gym: any;
  userId: string | null = null;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const gymId = this.route.snapshot.paramMap.get('id');
  
    if (gymId) {
      this.apiService.getGymById(gymId).subscribe({
        next: (data) => {
          this.gym = data;
          console.log("🏋️‍♂️ Gym Details:", this.gym);
  
          // Split the pricing_bundles and prices into arrays
          this.gym.pricing_bundles = this.gym.pricing_bundles ? this.gym.pricing_bundles.split(',') : [];
          this.gym.prices = this.gym.prices ? this.gym.prices.split(',') : [];
  
          console.log("Pricing Bundles:", this.gym.pricing_bundles);
          console.log("Prices:", this.gym.prices);
        },
        error: (err) => console.error("❌ Error fetching gym:", err)
      });
    }
  
    // Load User ID from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      this.userId = JSON.parse(user).id;
    }
  }

  saveGym(): void {
    if (!this.userId) {
      alert("You must be logged in to save a gym!");
      return;
    }

    this.apiService.saveGym(this.userId, this.gym.id).subscribe({
      next: () => alert("Gym saved successfully!"),
      error: (err) => console.error("❌ Error saving gym:", err)
    });
  }
}
