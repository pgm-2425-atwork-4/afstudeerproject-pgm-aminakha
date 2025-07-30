import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GymService } from '../../services/gym.service';
import { CommentService } from '../../services/comment.service';
import { MetaDataService } from '../../services/meta-data.service';

@Component({
  standalone: true,
  selector: 'app-gym-detail',
  templateUrl: './gym-detail.component.html',
  styleUrls: ['./gym-detail.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class GymDetailComponent implements OnInit {
  form = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required, Validators.minLength(5)])
  });
  get title() {
    return this.form.get('title');
  }
  get description() {
    return this.form.get('description');
  }

  gym: any;
  userId: string | null = null;
  user: any;
  profile_image = '';
  gymImages: any = [];
  gymPrices: any[] = [];
  prices: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private commentService: CommentService,
    private gymService: GymService,
    private metaDataService: MetaDataService
  ) {}

  ngOnInit(): void {
    const gymId = this.route.snapshot.paramMap.get('id');

    if (gymId) {
      this.gymService.getGymImages(gymId).subscribe({
        next: (images) => (this.gymImages = images),
        error: (err) => console.error('❌ Error fetching gym images:', err)
      });

      this.gymService.getGymById(gymId).subscribe({
        next: (data) => {
          this.gym = data;
          this.fetchComments(this.gym.id);
          this.fetchPrices(this.gym.id);
        },
        error: (err) => console.error('❌ Error fetching gym:', err)
      });
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      const decodedToken = this.decodeJWT(token);
      if (decodedToken?.id) {
        this.userId = decodedToken.id.toString();
        this.user = decodedToken;
        this.profile_image = decodedToken.profile_image;
      }
    }
  }

  decodeJWT(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = atob(parts[1]);
    return JSON.parse(decoded);
  }

  fetchComments(gymId: string): void {
  this.commentService.getComments(gymId).subscribe({
    next: (data: any[]) => {
      if (data && data.length > 0) {
        this.gym.comments = data.map((comment) => ({
          ...comment,
          username: comment.username || 'Unknown User',
          profile_image: comment.profile_image || 'path_to_default_image.jpg'
        }));
      } else {
        this.gym.noCommentsMessage = 'Wees de eerste die een reactie achterlaat!';
      }
    },
    error: (err) => {
      console.error('❌ Error fetching comments:', err);
      this.gym.noCommentsMessage = 'Kon de reacties niet ophalen. Probeer het later opnieuw.';
    }
  });
}

  submitComment(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const newCommentData = {
      gymId: this.gym.id,
      commentText: this.form.value.description,
      title: this.form.value.title
    };

    this.commentService.addComment(newCommentData).subscribe({
      next: (data) => {
        alert('Comment submitted successfully!');
        this.gym.comments.push(data);
        this.form.reset();
      },
      error: (err) => {
        console.error('❌ Error adding comment:', err);
        alert('Failed to submit comment!');
      }
    });
  }

  fetchPrices(gymId: number): void {
    this.metaDataService.getPrices().subscribe({
      next: (data: any) => {
        this.prices = data;
        this.gymPrices = this.prices.filter((price) => price.gym_id === gymId);
      },
      error: (error) => console.error('🔥 Error fetching prices:', error)
    });
  }

  saveGym(): void {
    if (!this.userId) {
      alert('You must be logged in to save a gym!');
      return;
    }

    this.gymService.saveGym(this.userId, this.gym.id).subscribe({
      next: () => alert('Gym saved successfully!'),
      error: (err) => console.error('❌ Error saving gym:', err)
    });
  }
}

