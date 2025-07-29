import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MetaDataService } from '../../services/meta-data.service';
import { ExerciseService } from '../../services/exercise.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommentService } from '../../services/comment.service';

@Component({
  selector: 'app-exercise-detail',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ExerciseDetailComponent {
  constructor(private exerciseService: ExerciseService, private route: ActivatedRoute, private commentService: CommentService) { }
  id : any;
  exercise: any;
  exerciseImages: any[] = [];
  userId: string | null = null;
  user: any;
  profile_image: any;
  form = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required])
  });
  comments: any[] = [];
  noCommentsMessage: string = 'Er zijn nog geen reacties op deze oefening. Wees de eerste om een reactie achter te laten!';
  ngOnInit() {
      this.id = this.route.snapshot.params['id'];
      console.log(`🔍 Fetching details for exercise ID: ${this.id}`);
      this.exerciseService.getExerciseById(this.id).subscribe(exercise => {
        this.exercise = exercise;
        console.log(this.exercise);
    });
    this.exerciseService.getExerciseImages(this.id).subscribe((data: any) => {
      this.exerciseImages = data;
      console.log(this.exerciseImages);
    });
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      const decodedToken = this.decodeJWT(token);
      if (decodedToken?.id) {
        this.userId = decodedToken.id.toString();
        this.user = decodedToken;
        this.profile_image = decodedToken.profile_image;
      }
    }
    this.commentService.getExerciseComments(this.id).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (err) => {
        console.error('❌ Error fetching exercise comments:', err);
        this.noCommentsMessage = 'Er is een fout opgetreden bij het ophalen van de reacties.';
      }
    });
    
  }
  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  }

  saveExercise(): void {
    if (!this.userId) {
      alert('You must be logged in to save an exercise!');
      return;
    }

    this.exerciseService.saveExercise(this.userId, this.exercise.id).subscribe({
      next: () => alert('Gym saved successfully!'),
      error: (err) => console.error('❌ Error saving gym:', err)
    });
  }
  submitComment(): void {
    console.log(this.form.value);
    
    if (!this.userId) {
      alert('You must be logged in to submit a comment!');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const newCommentData = {
      title: this.form.value.title,
      description: this.form.value.description
    };
    console.log('Submitting comment:', newCommentData);
    
    this.commentService.addExerciseComment(this.exercise.id, newCommentData).subscribe({
      next: (data) => {
        alert('Comment submitted successfully!');
        this.form.reset();
      },
      error: (err) => {
        console.error('❌ Error adding comment:', err);
        alert('Failed to submit comment!');
      }
    });
  }
}
