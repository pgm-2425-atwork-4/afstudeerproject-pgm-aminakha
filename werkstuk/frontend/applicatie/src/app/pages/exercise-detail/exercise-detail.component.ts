import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MetaDataService } from '../../services/meta-data.service';
import { ExerciseService } from '../../services/exercise.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-exercise-detail',
  imports: [CommonModule],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.css'
})
export class ExerciseDetailComponent {
  constructor(private exerciseService: ExerciseService, private route: ActivatedRoute) { }
  id : any;
  exercise: any;
  ngOnInit() {
      this.id = this.route.snapshot.params['id'];
      console.log(`🔍 Fetching details for exercise ID: ${this.id}`);
      this.exerciseService.getExerciseById(this.id).subscribe(exercise => {
        this.exercise = exercise;
        console.log(this.exercise);
    });
  }

}
