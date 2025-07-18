import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GymCardComponent } from '../../components/gym-card/gym-card.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule,GymCardComponent,RouterLink, ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileImage: File | null = null;
  showForm: boolean = false;  
  savedGyms: any[] = [];
  form = new FormGroup({
    username: new FormControl(''),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    email: new FormControl(''),
    birthday: new FormControl('')
  })
  constructor(private authService: AuthService, private gymService: GymService) {}

  toggleFormVisibility() {
    this.showForm = !this.showForm; 
  }

  ngOnInit() {
  
    const token = localStorage.getItem("auth_token"); 
    console.log("🔍 Stored Token:", token);

    if (token) {
     
      const decodedToken = this.decodeJWT(token);
      console.log("🔑 Decoded Token:", decodedToken);

      if (decodedToken && decodedToken.id) {
        const userId = decodedToken.id.toString();
        console.log("🆔 User ID from Token:", userId);

        this.authService.getUserById(userId).subscribe({
          next: (user) => {
            console.log("✅ User Data:", user);
            this.user = user;
          },
          error: (error) => {
            console.error("🔥 Error fetching user:", error);
          }
        });

        this.fetchSavedGyms(userId);
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

  fetchSavedGyms(userId: string) {
    this.gymService.getSavedGyms(userId).subscribe({
      next: (res: any) => {
        console.log("✅ Saved Gyms Loaded:", res);
        this.savedGyms = res; 
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

    this.gymService.deleteSavedGym(userId, gymId).subscribe({
      next: (res) => {
        console.log("✅ Saved Gym deleted:", res);
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

    formData.append('username', this.user.username);
    formData.append('firstname', this.user.firstname);
    formData.append('lastname', this.user.lastname);
    formData.append('email', this.user.email);
    const formattedBirthday = new Date(this.user.birthday).toISOString().split('T')[0]; 
    formData.append('birthday', formattedBirthday);
   
    if (this.profileImage) {
      formData.append('profileImage', this.profileImage);
    }

    this.authService.updateUserProfile(this.user.id, formData).subscribe({
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
