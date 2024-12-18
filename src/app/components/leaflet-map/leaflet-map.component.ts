import { Component, Input, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-leaflet-map',
  templateUrl: './leaflet-map.component.html',
  styleUrls: ['./leaflet-map.component.css']
})
export class LeafletMapComponent implements OnInit {
  @Input() coordenadas: number[] = [0, 0]; // Coordenadas por defecto
  map!: L.Map; // Asegurar que 'map' siempre esté definido
  marker?: L.Marker; // Inicializado como opcional

  ngOnInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    const latLng: L.LatLngExpression = [this.coordenadas[0], this.coordenadas[1]];
    this.map = L.map('leaflet-map').setView(latLng, 13);

    // Agregar capa base al mapa
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Agregar marcador inicial
    this.addDraggableMarker(latLng);

    // Manejar el evento de clic en el mapa
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.updateMarkerPosition([lat, lng]);
    });
  }

  private addDraggableMarker(latLng: L.LatLngExpression): void {
    // Crear un marcador arrastrable solo si no existe
    if (!this.marker) {
      this.marker = L.marker(latLng, { draggable: true }).addTo(this.map);

      // Escuchar el evento de arrastre del marcador
      this.marker.on('dragend', () => {
        const position = this.marker!.getLatLng(); // Aserción segura
        console.log(`Nueva posición: ${position.lat}, ${position.lng}`);
      });
    }
  }

  private updateMarkerPosition(latLng: L.LatLngExpression): void {
    // Verifica si 'map' está definido antes de continuar
    if (!this.map) {
      console.error("El mapa no está definido.");
      return;
    }

    // Si el marcador existe, actualizar su posición
    if (this.marker) {
      this.marker.setLatLng(latLng);
    } else {
      // Si el marcador no existe, crearlo
      this.addDraggableMarker(latLng);
    }
  }
}
