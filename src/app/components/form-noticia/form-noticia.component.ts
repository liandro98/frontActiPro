import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Noticias } from 'src/app/interfaces/noticias';
import { NoticiasService } from 'src/app/services/noticias.service';

@Component({
  selector: 'app-form-noticia',
  templateUrl: './form-noticia.component.html',
  styleUrls: ['./form-noticia.component.css']
})
export class FormNoticiaComponent {
  noticiasForm: FormGroup;
  noticias : Noticias[] = []
  

  constructor(private fb: FormBuilder, private noticiasService : NoticiasService) {
    this.noticiasForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      contenido: ['', [Validators.required]],
      autor: ['', [Validators.required]],
      fecha: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    +this.obtenerNoticias()
  }

  onSubmit(): void {
    if (this.noticiasForm.valid) {
      const noticia: Noticias = this.noticiasForm.value;
      console.log('Noticia guardada:', noticia)
      this.noticiasService.createNoticias(noticia).subscribe({
        next: (response) => {
          console.log('Noticia creada:', response)
          this.noticiasForm.reset();
        },
        error: (error) => {
          console.error('Error al crear noticia: ', error)
        },
      })
    } else {
      console.error('Formulario inválido');
      
    }
  }

  obtenerNoticias(): void{
    this.noticiasService.getNotifcias().subscribe({
      next: (data: Noticias[]) => {
        this.noticias = data
        console.log('Noticias obtenidad: ', this.noticias)
      },
      error: (error) => {
        console.error('Error al obtener notcias: ', error)
      }
    })
  }

  eliminarNoticias(idNoticia: number){
    this.noticiasService.deleteNoticias(idNoticia).subscribe({
      next: (response) => {
        console.log('Noticia eliminada: ', response)
        this.obtenerNoticias()
      },
      error: (error) => {
        console.log('Error al eliminar noticia', error)
      }
    })
  }

}
