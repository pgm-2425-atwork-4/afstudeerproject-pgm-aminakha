import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GymCategoryComponent } from './gym-category.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CategoryService } from '../../services/category.service';

describe('GymCategoryComponent', () => {
  let component: GymCategoryComponent;
  let fixture: ComponentFixture<GymCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, HttpClientModule, GymCategoryComponent], 
      providers: [CategoryService] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
