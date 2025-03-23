import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service'; // Use ApiService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-gym-detail',
  templateUrl: './gym-detail.component.html',
  styleUrls: ['./gym-detail.component.css'],
  imports: [CommonModule, FormsModule]
})

export class GymDetailComponent implements OnInit {

  gym: any;
  userId: string | null = null;
  prices: any[] = [];
  gymPrices: any[] = [];
  gymComments: any[] = []; // Use any[] to store comments
  newComment: string = "";
  newCommentTitle: string = "";
  user: any;  // Define the user property here

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit(): void {
    const gymId = this.route.snapshot.paramMap.get('id');
  
    if (gymId) {
      this.apiService.getGymById(gymId).subscribe({
        next: (data) => {
        
          
          this.gym = data;
          console.log("🏋️‍♂️ Gym Details:", this.gym);
          this.fetchComments(this.gym.id);
          this.fetchPrices(this.gym.id);
        },
        error: (err) => console.error("❌ Error fetching gym:", err)
      });
    }

    // Fetch user info from localStorage and decode JWT token
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decodedToken = this.decodeJWT(token); // Decode the JWT token
      console.log("🔑 Decoded Token:", decodedToken);
      
      if (decodedToken && decodedToken.id) {
        this.userId = decodedToken.id.toString(); // Set userId from token
        this.user = decodedToken;  // Set the user object from decoded token
        console.log("🆔 User ID from Token:", this.userId);
      }
    }
  }

  // Decode JWT Token function
  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Invalid token structure");
      return null;
    }

    const payload = parts[1]; // The payload is the second part of the token
    const decoded = atob(payload); // Decode the Base64 string
    return JSON.parse(decoded); // Parse it into a JSON object
  }

  // Fetch the comments for the gym from the backend
  fetchComments(gymId: string): void {
    this.apiService.getComments(gymId).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.gym.comments = data.map((comment: Comment) => {  // Type the comment parameter
            return {
              ...comment,
              username: comment.username || 'Unknown User', // Ensure username is available
              profile_image: comment.profile_image || 'path_to_default_image.jpg' // Fallback image
            };
          });
          console.log("💬 Comments for Gym:", this.gym.comments);
        } else {
          console.log("No comments available for this gym.");
          this.gym.noCommentsMessage = "Be the first to comment!";
        }
      },
      error: (err) => {
        console.error("❌ Error fetching comments:", err);
        this.gym.noCommentsMessage = "Failed to fetch comments. Please try again later.";
      },
    });
  }

  // Submit a new comment
  submitComment(): void {
    if (!this.userId) {
      alert("You must be logged in to submit a comment!");
      return;
    }

    const newCommentData = {
      gymId: this.gym.id,
      commentText: this.newComment,
      title: this.newCommentTitle,
    };

    this.apiService.addComment(newCommentData).subscribe({
      next: (data) => {
        alert("Comment submitted successfully!");
        this.gym.comments.push(data); // Add the new comment to the list
        this.newComment = ""; // Reset the comment input
        this.newCommentTitle = ""; // Reset the title input
      },
      error: (err) => {
        console.error("❌ Error adding comment:", err);
        alert("Failed to submit comment!");
      },
    });
  }

  // Fetch pricing data for the gym
  fetchPrices(gymId: number) {
    this.apiService.getPrices().subscribe({
      next: (data) => {
        this.prices = data;
        console.log("💰 Prices loaded:", this.prices);
        this.gymPrices = this.prices.filter(price => price.gym_id === gymId);
        console.log("🏷️ Filtered Prices:", this.gymPrices);
      },
      error: (error) => {
        console.error("🔥 Error fetching prices:", error);
      }
    });
  }

  // Save the gym to the user's list
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

interface Comment {
  id: number;
  user_id: number;
  gym_id: number;
  comment_text: string;
  created_at: string;
  title: string;
  likes: number;
  username?: string;
  profile_image?: string;
}
