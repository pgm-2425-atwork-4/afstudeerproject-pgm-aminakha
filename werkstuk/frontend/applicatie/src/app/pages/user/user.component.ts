import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service'; // ✅ Import API Service

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileImage: File | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Fetch user details (Similar to how you fetch gym details)
    const userId = '26';  // Example, use dynamic ID in your case
    this.apiService.getUserById(userId).subscribe({
      next: (user) => {
        console.log("✅ User Data:", user);
        this.user = user;
      },
      error: (error) => {
        console.error("🔥 Error fetching user:", error);
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
    formData.append('birthday', this.user.birthday);
    
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
