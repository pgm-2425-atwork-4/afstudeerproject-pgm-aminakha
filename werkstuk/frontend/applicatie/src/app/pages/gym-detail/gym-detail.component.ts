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
  gymComments: any[] = []; 
  newComment: string = "";
  newCommentTitle: string = "";
  user: any; 
  profile_image  = '';  
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

    const token = localStorage.getItem('auth_token');
    if (token) {
      const decodedToken = this.decodeJWT(token); 
      console.log("🔑 Decoded Token:", decodedToken);
      
      if (decodedToken && decodedToken.id) {
        this.userId = decodedToken.id.toString(); 
        this.user = decodedToken;  
        this.profile_image = decodedToken.profile_image;  

        console.log("🆔 User ID from Token:", this.userId + this.profile_image);
      }
    }
  }

  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error("❌ Invalid token structure");
      return null;
    }

    const payload = parts[1]; 
    const decoded = atob(payload); 
    return JSON.parse(decoded); 
  }

  fetchComments(gymId: string): void {
    this.apiService.getComments(gymId).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.gym.comments = data.map((comment: Comment) => {  
            return {
              ...comment,
              username: comment.username || 'Unknown User',
              profile_image: comment.profile_image || 'path_to_default_image.jpg'
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
        this.gym.comments.push(data); 
        this.newComment = ""; 
        this.newCommentTitle = ""; 
      },
      error: (err) => {
        console.error("❌ Error adding comment:", err);
        alert("Failed to submit comment!");
      },
    });
  }

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
