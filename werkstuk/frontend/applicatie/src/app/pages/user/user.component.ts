import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core'; 
import { ApiService } from '../../services/api.service'; // ✅ Import API Service
import { FormsModule } from '@angular/forms';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [ApiService] // ✅ Provide the service
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileImage: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService, // ✅ Use API Service
    private cdr: ChangeDetectorRef, 
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('id');
      if (userId) {
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
    });
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
      formData.append('profileImage', this.profileImage);
    }

    // Fetch token from localStorage
    const token = localStorage.getItem('auth_token');
    console.log("🔐 Auth token:", token);

    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    // Create HttpHeaders with Authorization token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Sending the token in the Authorization header
    });

    // Call API to update profile
    this.apiService.updateUserProfile(this.user.id, formData, { headers }).subscribe(
      (response) => {
        console.log('Profile updated:', response);
      },
      (error) => {
        console.error('Error updating profile:', error);
      }
    );
  }

  getProfileImageUrl(profileImage: string): string {
    if (!profileImage) {
      return 'images/default-user.jpg'; // ✅ Show default image if no profile picture
    }
    return `https://afstudeerproject-pgm-aminakha.onrender.com${profileImage}`;
  }
}
