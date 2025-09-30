import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailNameComponent } from './email-name.component';

describe('EmailNameComponent', () => {
  let component: EmailNameComponent;
  let fixture: ComponentFixture<EmailNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
