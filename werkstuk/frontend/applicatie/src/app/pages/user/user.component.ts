import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { ExerciseService } from '../../services/exercise.service';
import { InfoCardComponent } from '../../components/info-card/info-card.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReactiveFormsModule, InfoCardComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  profileImage: File | null = null;
  showForm: boolean = false;  
  savedGyms: any[] = [];
  savedExercises: any[] = [];

  form = new FormGroup({
    username: new FormControl(''),
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    email: new FormControl(''),
    birthday: new FormControl('')
  });

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private exerciseService: ExerciseService
  ) {}

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

            this.gymService.getSavedGyms(userId).subscribe({
              next: (res: any) => {
                console.log("✅ Saved Gyms Loaded:", res);
                this.savedGyms = res;
              },
              error: (err) => {
                  console.error("🔥 Error fetching saved gyms:", err);    
              }
            });

            this.exerciseService.savedExercises(userId).subscribe({
              next: (res: any) => {
                console.log("✅ Saved Exercises Loaded:", res);
                this.savedExercises = res; 
              },
              error: (err) => {
                console.error("🔥 Error fetching saved exercises:", err);
              }
            });
          },
          error: (error) => {
            console.error("🔥 Error fetching user:", error);
          }
        });
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

  toggleFormVisibility() {
    this.showForm = !this.showForm; 
  }
}
