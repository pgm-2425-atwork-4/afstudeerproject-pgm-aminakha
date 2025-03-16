import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core'; 
import { ApiService } from '../../services/api.service'; // ✅ Import API Service

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [ApiService] // ✅ Provide the service
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  isBrowser: boolean = false; 

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

  loadUserProfile() {
    const userId = this.route.snapshot.paramMap.get('id'); 
    console.log("🔍 Fetching user with ID:", userId); 
    if (!userId) {
      console.error("❌ No user ID found in route");
      return;
    }
    if (userId) {
      this.apiService.getUserById(userId).subscribe({
        next: (res) => {
          console.log("✅ User data received:", res);
          this.user = res;
          this.cdr.detectChanges(); // Force UI update
        },
        error: (error) => {
          console.error("🔥 Error fetching user:", error);
        }
      });
    }
  }

  /**
   * ✅ Format profile image URL correctly for Render deployment
   */
  getProfileImageUrl(profileImage: string): string {
    if (!profileImage) {
      return 'images/default-user.jpg'; // ✅ Show default image if no profile picture
    }
    return `https://afstudeerproject-pgm-aminakha.onrender.com${profileImage}`;
  }
}
