import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service'; // ✅ Import API Service
import { GymCardComponent } from '../../components/gym-card/gym-card.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule,GymCardComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileImage: File | null = null;
  showForm: boolean = false;  // Add this line to control form visibility
  savedGyms: any[] = []; // Array to hold saved gyms

  constructor(private apiService: ApiService) {}

  toggleFormVisibility() {
    this.showForm = !this.showForm;  // Toggle the form visibility
  }

  ngOnInit() {
    // Fetch user details and the saved gyms for the logged-in user
    const token = localStorage.getItem("auth_token"); // Get the token from localStorage
    console.log("🔍 Stored Token:", token); // Log the token for debugging

    if (token) {
      // Decode the token to extract the user ID (from the JWT token)
      const decodedToken = this.decodeJWT(token);
      console.log("🔑 Decoded Token:", decodedToken);

      if (decodedToken && decodedToken.id) {
        const userId = decodedToken.id.toString();
        console.log("🆔 User ID from Token:", userId);

        // Fetch user data by userId
        this.apiService.getUserById(userId).subscribe({
          next: (user) => {
            console.log("✅ User Data:", user);
            this.user = user;
          },
          error: (error) => {
            console.error("🔥 Error fetching user:", error);
          }
        });

        // Fetch saved gyms for the user
        this.fetchSavedGyms(userId);
      }
    }
  }

  // Decode JWT Token function to extract user details
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

  // Fetch saved gyms using userId
  fetchSavedGyms(userId: string) {
    this.apiService.getSavedGyms(userId).subscribe({
      next: (res) => {
        console.log("✅ Saved Gyms Loaded:", res);
        this.savedGyms = res; // Store saved gyms
      },
      error: (err) => {
        console.error("🔥 Error fetching saved gyms:", err);
      }
    });
  }

  deleteSavedGym(gymId: string) {
    const userId = this.user?.id;
    if (!userId) {
      console.error("❌ No user ID available");
      return;
    }

    this.apiService.deleteSavedGym(userId, gymId).subscribe({
      next: (res) => {
        console.log("✅ Saved Gym deleted:", res);
        // Remove the deleted gym from the savedGyms array
        this.savedGyms = this.savedGyms.filter(gym => gym.id !== gymId);
        alert("Gym deleted successfully!");
      },
      error: (err) => {
        console.error("🔥 Error deleting gym:", err);
        alert("Failed to delete gym.");
      }
    });
  }
  onImageSelected(event: any) {
    this.profileImage = event.target.files[0];
  }

  updateUserProfile() {
    const formData = new FormData();

    // Append user data to FormData
    formData.append('username', this.user.username);
    formData.append('firstname', this.user.firstname);
    formData.append('lastname', this.user.lastname);
    formData.append('email', this.user.email);
    const formattedBirthday = new Date(this.user.birthday).toISOString().split('T')[0]; 
    formData.append('birthday', formattedBirthday);
   
    if (this.profileImage) {
      formData.append('profileImage', this.profileImage);
    }

    // Make the API call using the ApiService
    this.apiService.updateUserProfile(this.user.id, formData).subscribe({
      next: (res) => {
        console.log("✅ Profile Updated:", res);
        alert("Profile updated successfully!");
      },
      error: (err) => {
        console.error("🔥 Error updating profile:", err);
        alert("Failed to update profile.");
      }
    });
  }
}
