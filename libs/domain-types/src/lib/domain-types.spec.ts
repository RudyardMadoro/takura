import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomainTypes } from './domain-types';

describe('DomainTypes', () => {
  let component: DomainTypes;
  let fixture: ComponentFixture<DomainTypes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomainTypes],
    }).compileComponents();

    fixture = TestBed.createComponent(DomainTypes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
