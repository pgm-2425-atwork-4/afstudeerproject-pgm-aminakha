import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MetaDataService } from '../../services/meta-data.service';
import { ExerciseService } from '../../services/exercise.service';

@Component({
  selector: 'app-exercise-detail',
  imports: [CommonModule],
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.css'
})
export class ExerciseDetailComponent {
  constructor(private exerciseService: ExerciseService) { }
  ngOnInit() {
    this.exerciseService.getExerciseById('1').subscribe(exercise => {
      console.log(exercise);
    });
  }

}
