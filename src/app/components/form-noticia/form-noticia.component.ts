import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Noticias } from 'src/app/interfaces/noticias';

@Component({
  selector: 'app-form-noticia',
  templateUrl: './form-noticia.component.html',
  styleUrls: ['./form-noticia.component.css']
})
export class FormNoticiaComponent {
  noticiasForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.noticiasForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      contenido: ['', [Validators.required]],
      autor: ['', [Validators.required]],
      fecha: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.noticiasForm.valid) {
      const noticia: Noticias = this.noticiasForm.value;
      console.log('Noticia guardada:', noticia);
      // Aquí podrías enviar los datos al backend usando un servicio
    } else {
      console.error('Formulario inválido');
    }
  }

}
