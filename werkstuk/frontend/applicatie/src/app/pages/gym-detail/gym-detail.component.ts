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
  imports: [CommonModule,FormsModule]
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
  
    // Fetching logged-in user info from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      this.userId = JSON.parse(user).id;
      this.user = JSON.parse(user);  // Set user object
    }
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
  likeComment(commentId: number): void {
    const userId = this.userId; // Ensure this is a number, or handle it if it's null/undefined
    
    if (!userId) {
      console.error('User ID is not valid');
      return;
    }
  
    // Ensure the userId is a number before sending the request
    const userIdNumber = Number(userId); // Convert to number
    
    // Check if the userId is still not a valid number after conversion
    if (isNaN(userIdNumber)) {
      console.error('User ID is invalid after conversion');
      return;
    }
  
    // Find the comment
    const comment = this.gym.comments.find((c: { id: number, liked_by_users: Array<string | number> }) => c.id === commentId);
  
    if (!comment) {
      console.error('Comment not found');
      return;
    }
  
    // Check if the user has already liked the comment
    const likedUsers = comment.liked_by_users;
  
    if (likedUsers && likedUsers.includes(userIdNumber)) {
      console.log("You have already liked this comment");
      alert("You have already liked this comment");
      return;
    }
  
    // Proceed to like the comment (send the request)
    this.apiService.likeComment(commentId, userIdNumber).subscribe({
      next: (response) => {
        console.log("Comment liked successfully!");
  
        // Update the UI locally
        comment.likes++; // Increment the like count
        comment.liked_by_users.push(userIdNumber); // Add userId to the liked_by_users array
      },
      error: (err) => {
        console.error("Error liking comment:", err);
        if (err.error && err.error.error) {
          alert(err.error.error); // Show error message
        } else {
          alert("Failed to like the comment. Please try again later.");
        }
      }
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