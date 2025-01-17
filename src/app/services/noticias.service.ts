import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Noticias } from '../interfaces/noticias';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  // Modo desarrollo 
  //private API_URL = 'http://localhost:3000/api/noticias';


  // Modo produccion 
    API_URL ='https://apiactpro.onrender.com/api/noticias';

  constructor(private http : HttpClient) { }

  getNotifcias(): Observable<Noticias[]>{
    return this.http.get<Noticias[]>(this.API_URL)
  }

  createNoticias(noticia: Noticias): Observable<any>{
    return this.http.post(this.API_URL, noticia)
  }

  updateNoticias(id: number, noticia: Noticias): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}`, noticia)
  }

  deleteNoticias(idNoticia: number): Observable<any>{
    return this.http.delete(`${this.API_URL}/${idNoticia}`)
  }
}
