import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrupsListComponent } from './grups-list.component';

describe('GrupsListComponent', () => {
  let component: GrupsListComponent;
  let fixture: ComponentFixture<GrupsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
