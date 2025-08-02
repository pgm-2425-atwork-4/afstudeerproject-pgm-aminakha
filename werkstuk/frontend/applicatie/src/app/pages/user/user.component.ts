import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  successMessage: string = '';
  errorMessage: string = '';

  form = new FormGroup({
    username: new FormControl('', Validators.required),
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    birthday: new FormControl('', Validators.required)
  });

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private exerciseService: ExerciseService
  ) {}

  get username() { return this.form.get('username'); }
  get firstname() { return this.form.get('firstname'); }
  get lastname() { return this.form.get('lastname'); }
  get email() { return this.form.get('email'); }
  get birthday() { return this.form.get('birthday'); }

  handleExerciseDeleted(deletedId: string) {
    this.savedExercises = this.savedExercises.filter(ex => ex.id !== deletedId);
  }

  handleGymDeleted(deletedId: string) {
    this.savedGyms = this.savedGyms.filter(gym => gym.id !== deletedId);
  }

  ngOnInit() {
    const token = localStorage.getItem("auth_token");
    if (token) {
      const decodedToken = this.decodeJWT(token);
      if (decodedToken?.id) {
        const userId = decodedToken.id.toString();

        this.authService.getUserById(userId).subscribe({
          next: (user) => {
            this.user = user;
            this.form.patchValue({
              username: user.username,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              birthday: user.birthday?.split('T')[0] || ''
            });

            this.gymService.getSavedGyms(userId).subscribe({
              next: (res: any) => {
                this.savedGyms = res || [];
              },
              error: (err) => {
                console.error("Error fetching saved gyms:", err);
              }
            });

            this.exerciseService.savedExercises(userId).subscribe({
              next: (res: any) => {
                this.savedExercises = res || [];
              },
              error: (err) => {
                console.error("Error fetching saved exercises:", err);
              }
            });
          },
          error: (err) => {
            console.error("Error fetching user:", err);
          }
        });
      }
    }
  }

  decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = atob(parts[1]);
      return JSON.parse(payload);
    } catch (e) {
      console.error('Invalid JWT token', e);
      return null;
    }
  }

  onImageSelected(event: any) {
    this.profileImage = event.target.files[0];
  }

  updateUserProfile() {
    if (this.form.invalid || !this.user) return;

    const formValue = this.form.value;
    const formData = new FormData();
    formData.append('username', formValue.username!);
    formData.append('firstname', formValue.firstname!);
    formData.append('lastname', formValue.lastname!);
    formData.append('email', formValue.email!);
    formData.append('birthday', new Date(formValue.birthday!).toISOString().split('T')[0]);

    if (this.profileImage) {
      formData.append('profileImage', this.profileImage);
    }

    this.authService.updateUserProfile(this.user.id, formData).subscribe({
      next: () => {
        this.successMessage = "Profiel succesvol bijgewerkt!";
        this.errorMessage = '';
      },
      error: () => {
        this.errorMessage = "Fout bij het bijwerken van het profiel.";
        this.successMessage = '';
      }
    });
  }

  toggleFormVisibility() {
    this.showForm = !this.showForm;
  }
}
