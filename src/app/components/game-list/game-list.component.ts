import { Component,OnInit,HostBinding  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NoticiasService } from 'src/app/services/noticias.service';
import { Noticias } from 'src/app/interfaces/noticias';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.css']
})
export class GameListComponent implements OnInit{

  noticiasL : Noticias[] = [] // Noticias Locales
  noticias: any[] = [];
  secciones: string[] = ['business', 'technology', 'health'];
  seccionSeleccionada: string = 'technology'; // Sección por def
  menuVisible = false;

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
    console.log('Menú visible:', this.menuVisible);
    const nav = document.querySelector('#nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (nav) {
      nav.classList.toggle('show', this.menuVisible);
    }
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', this.menuVisible.toString());
    }
  }
  

  constructor(private http: HttpClient, private noticiasService : NoticiasService) { }

  ngOnInit() {
    this.getNoticias();
    this.obtenerNoticias() 

}

// Noticas locales
obtenerNoticias(): void{
  this.noticiasService.getNotifcias().subscribe({
    next: (data: Noticias[]) => {
      this.noticiasL = data
      console.log('Noticias obtenidas: ', this.noticias)
    },
    error: (error) => {
      console.error('Error al obtener notcias: ', error)
    }
  })
}


// Noticas generadas de una API externa

getNoticias() {
  const apiKey = 'b073c116789b49fdbf89d59c1b7d6079';
  const apiUrl = `https://newsapi.org/v2/top-headlines?country=US&category=${this.seccionSeleccionada}&apiKey=${apiKey}`;

  this.http.get(apiUrl).subscribe((data: any) => {
    this.noticias = data.articles;
  });
}
cambiarSeccion(seccion: string) {
  this.seccionSeleccionada = seccion;
  this.getNoticias();
}

}

