import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNoticiaComponent } from './form-noticia.component';

describe('FormNoticiaComponent', () => {
  let component: FormNoticiaComponent;
  let fixture: ComponentFixture<FormNoticiaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormNoticiaComponent]
    });
    fixture = TestBed.createComponent(FormNoticiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
