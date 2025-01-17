import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { GamesService } from '../../services/games.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';

declare var paypal: { Buttons: (arg0: { createOrder: (data: any, actions: { order: { create: (arg0: { purchase_units: { description: string; amount: { currency_code: string; value: number; }; }[]; }) => any; }; }) => any; onApprove: (data: any, actions: { order: { capture: () => any; }; }) => Promise<void>; onError: (err: any) => void; }) => { (): any; new(): any; render: { (arg0: any): void; new(): any; }; }; };

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html',
  styleUrls: ['./game-form.component.css']
})
export class GameFormComponent implements OnInit, AfterViewInit {

  inputValue: number = 0.0;

  @ViewChild('paypal', { static: true }) paypalElement: ElementRef | any;
  @ViewChild('map') mapContainer: ElementRef | undefined;
  map: any;
  marker?: L.Marker;
  staticMarker?: L.Marker

  servicio = {
    descripcion: 'pago',
    precio: this.inputValue
  };

  title = 'angular-paypal-payment';

  // enlaces para reuniones
  links: any[] = [];

  act: any = [];
  usuarios: any = {};

  constructor(private gameService: GamesService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    if (typeof paypal !== 'undefined') {
      paypal
        .Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  description: this.servicio.descripcion,
                  amount: {
                    currency_code: 'MXN',
                    value: this.inputValue.toFixed(2), // Usar el valor del input
                  },
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            const order = await actions.order.capture();
            console.log('Pago aprobado:', order);
            alert(`Pago realizado con éxito por: ${order.payer.name.given_name}`);
          },
          onError: (err: any) => {
            console.error('Error en la transacción:', err);
            alert('Hubo un error procesando el pago.');
          },
        })
        .render(this.paypalElement.nativeElement);
    }

      this.authService.setCurrentUser();
    const userData: any = this.authService.getCurrentUser();
    this.usuarios = userData;
    console.log(this.usuarios.idUsuario);

    if (this.usuarios.idUsuario !== undefined && this.usuarios.idUsuario !== null) {
      this.getAct(this.usuarios.idUsuario);
    } else {
      console.error('El idUsuario es undefined');
      this.router.navigate(['/home']);
    }

    // Cargar reuniones
    this.loadTodayReunionLinks();
  }


  //Para que aparezca el mapa
  ngAfterViewInit(): void {
    if (this.mapContainer) {
      this.map = L.map(this.mapContainer.nativeElement).setView([21.161835, -100.930117], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  
      // Obtener y marcar la ubicación actual del usuario como un marcador estático
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
            this.addMarker(currentLocation, true);
            this.map.setView(currentLocation, 13); 
          },
          (error) => {
            console.error('No se pudo obtener la ubicación actual:', error);
            alert('No se pudo obtener la ubicación actual.');
          }
        );
      } else {
        console.error('geolocalización no está soportada en este navegador');
        alert('La geolocalización no está soportada en este navegador.');
      }
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        this.addMarker([lat, lng], false);
        if (this.marker && this.staticMarker) {
          this.calculateRoute(this.staticMarker.getLatLng(), this.marker.getLatLng()); // Calcula la ruta entre los dos marcadores
        }
      });
    }
  }
  
  // Agrega un marcador al mapa, especificando si es estático o dinámico
  private addMarker(latLng: L.LatLngExpression, isStatic: boolean): void {
    if (isStatic) {
      if (!this.staticMarker) {
        this.staticMarker = L.marker(latLng, { draggable: false, icon: L.icon({ iconUrl: 'static-marker-icon.png', iconSize: [25, 41] }) }).addTo(this.map);
      } else {
        this.staticMarker.setLatLng(latLng);
      }
    } else {
      if (!this.marker) {
        this.marker = L.marker(latLng, { draggable: true, icon: L.icon({ iconUrl: 'dynamic-marker-icon.png', iconSize: [25, 41] }) }).addTo(this.map);
        this.marker.on('dragend', () => {
          console.log(`Nueva posición del marcador: ${this.marker?.getLatLng().lat}, ${this.marker?.getLatLng().lng}`);
        });
      } else {
        this.marker.setLatLng(latLng);
      }
    }
  }
  
  private calculateRoute(start: L.LatLngExpression, end: L.LatLngExpression): void {
    L.Routing.control({
      waypoints: [L.latLng(start), L.latLng(end)],
      routeWhileDragging: true
    }).addTo(this.map);
  }
  
  

  //Este pues genera la ruta lol 
  generarRuta(coordenadas: string) {
    const coordenadasArray = coordenadas.split(',').map(coord => parseFloat(coord.trim()));

    if (coordenadasArray.length === 2) {
      const destinationCoordinates: [number, number] = [coordenadasArray[0], coordenadasArray[1]];

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const currentLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
            this.updateMapWithRoute(currentLocation, destinationCoordinates);
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported in this browser.');
      }
    } else {
      console.error('Invalid coordinates format:', coordenadas);
    }
  }
  //Actualiza la fokin ruta :)))))
  updateMapWithRoute(start: [number, number], end: [number, number]) {
    L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
    }).addTo(this.map);
  }
  getAct(idUsuario: number) {
    this.gameService.getact(idUsuario).subscribe(
      res => {
        console.log(res);
        this.act = res;
      },
      error => {
        console.error(error);
        this.router.navigate(['/home']);
      }
    );
  }
  cancelar(id: string) {
    if (this.usuarios.idUsuario !== undefined) {
      this.gameService.deleteact(id).subscribe(
        res => {
          console.log(res);
          this.getAct(this.usuarios.idUsuario!);
          alert('Actividad Cancelada');
        },
        error => {
          console.error(error);
          this.router.navigate(['/home']);
        }
      );
    } else {
      console.error('idUsuario is undefined');
    }
  }
  editact(id: string) {
    console.log(id);
  }
  mostrarValor() {
    console.log('Valor del input:', this.inputValue);
  }

  // Obtener reuniones el dia de hoy
  loadTodayReunionLinks(): void {
    this.gameService.getTodayReunionLinks().subscribe(
      (data) => {
        this.links = data;
      },
      (error) => {
        console.error('Error fetching today\'s reunion links', error);
      }
    );
  }
}
