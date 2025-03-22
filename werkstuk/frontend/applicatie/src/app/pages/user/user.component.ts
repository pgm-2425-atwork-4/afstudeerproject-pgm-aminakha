import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../../services/api.service'; // ✅ Import API Service

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileImage: File | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Get userId from localStorage
    const userId = localStorage.getItem('userId'); // Ensure it's stored after login
    if (userId) {
      this.apiService.getUserById(userId).subscribe({
        next: (user) => {
          this.user = user;
        },
        error: (error) => {
          console.error('Error fetching user:', error);
        }
      });
    }
  }

  onImageSelected(event: any) {
    this.profileImage = event.target.files[0];
  }

  updateUserProfile() {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('firstname', this.user.firstname);
    formData.append('lastname', this.user.lastname);
    formData.append('email', this.user.email);
    formData.append('birthday', this.user.birthday);
    if (this.profileImage) {
      formData.append('profileImage', this.profileImage); // Appending image file
    }

    this.apiService.updateUserProfile(this.user.id, formData).subscribe(
      (response) => {
        console.log('Profile updated:', response);
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }
}