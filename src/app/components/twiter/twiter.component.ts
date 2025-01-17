import { Component } from '@angular/core';
import { GamesService } from 'src/app/services/games.service';

@Component({
  selector: 'app-twiter',
  templateUrl: './twiter.component.html',
  styleUrls: ['./twiter.component.css']
})
export class TwiterComponent {
  tweet: string = ''; // Texto del tweet
  message: string | null = null; // Mensaje de estado

  constructor(private servicio: GamesService) {}

  sendTweet() {
    if (!this.tweet.trim()) {
      this.message = 'El tweet no puede estar vacío.';
      return;
    }

    this.servicio.sendTweet(this.tweet).subscribe(
      (response) => {
        this.message = 'Tweet enviado con éxito.';
        this.tweet = ''; // Limpiar el campo de texto
      },
      (error) => {
        console.error('Error al enviar el tweet:', error);
        this.message = 'Error al enviar el tweet.';
      }
    );
  }
}
