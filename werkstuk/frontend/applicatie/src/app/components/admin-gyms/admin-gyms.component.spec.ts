import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGymsComponent } from './admin-gyms.component';

describe('AdminGymsComponent', () => {
  let component: AdminGymsComponent;
  let fixture: ComponentFixture<AdminGymsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGymsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGymsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
