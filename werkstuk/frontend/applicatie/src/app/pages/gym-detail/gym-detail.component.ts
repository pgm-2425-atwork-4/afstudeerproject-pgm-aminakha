import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-gym-detail',
  templateUrl: './gym-detail.component.html',
  styleUrls: ['./gym-detail.component.css'],
  imports: [CommonModule]
})
export class GymDetailComponent implements OnInit {
  gym: any;
  userId: string | null = null;
  prices: any[] = []; // Full list of pricing options
  gymPrices: any[] = []; // Filtered list for the current gym
  gymComments: any[] = []; // Comments for the gym
  newComment: string = ""; // New comment to be added

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const gymId = this.route.snapshot.paramMap.get('id');

    if (gymId) {
      this.apiService.getGymById(gymId).subscribe({
        next: (data) => {
          this.gym = data;
          console.log("🏋️‍♂️ Gym Details:", this.gym);
  
          // Ensure pricing_bundles and prices are parsed properly
          this.gym.pricing_bundles = this.gym.pricing_bundles ? this.gym.pricing_bundles.split(',') : [];
          this.gym.prices = this.gym.prices ? this.gym.prices.split(',') : [];
  
          console.log("Pricing Bundles:", this.gym.pricing_bundles);
          console.log("Prices:", this.gym.prices);

          // Fetch prices and filter them for the current gym
          this.fetchPrices(this.gym.id);
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

  fetchComments(gymId: string): void {
    this.apiService.getComments(gymId).subscribe({
      next: (data) => {
        this.gym.comments = data;
        console.log("💬 Comments for Gym:", this.gym.comments);
      },
      error: (err) => console.error("❌ Error fetching comments:", err)
    });
  }
  submitComment(): void {
    if (!this.userId) {
      alert("You must be logged in to submit a comment!");
      return;
    }

    const newCommentData = {
      user_id: this.userId,
      gym_id: this.gym.id,
      comment_text: this.newComment
    };

    this.apiService.addComment(newCommentData).subscribe({
      next: (data) => {
        alert("Comment submitted successfully!");
        this.gym.comments.push(data); // Add new comment to the list
        this.newComment = ""; // Reset the comment input
      },
      error: (err) => console.error("❌ Error adding comment:", err)
    });
  }

  fetchPrices(gymId: number) {
    this.apiService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;
        console.log("💰 Prices loaded:", this.prices);

        // Filter prices based on the current gym's ID
        this.gymPrices = this.prices.filter(price => price.gym_id === gymId);
        console.log("🏷️ Filtered Prices:", this.gymPrices);
      },
      error: (error) => {
        console.error("🔥 Error fetching prices:", error);
      }
    });
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
