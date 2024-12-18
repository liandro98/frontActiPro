import { Component, OnInit, HostBinding, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Activities } from 'src/app/interfaces/actividades';
import { GamesService } from '../../services/games.service';
import { Draggable, icon, Map, marker, tileLayer, latLng, routing, Marker } from 'leaflet';

import 'leaflet-routing-machine'
import { PlacesService } from 'src/app/services/places.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-add-act',
  templateUrl: './add-act.component.html',
  styleUrls: ['./add-act.component.css'],

})
export class AddActComponent implements OnInit {
  Enc: any = [];
  Par: any = [];
  Est: any = [];

  changeLugar(lugar: string) {
    this.activities.Lugar = lugar;
  }

  constructor(private gameService: GamesService, private router: Router, private activateRouter: ActivatedRoute, private placeSvc: PlacesService) { }
  ngOnInit(): void {

    if (this.activities.Lugar == '') {
      this.changeLugar('21.168709834371708, -100.93142807890231')
    }

    this.contador = 0;

    setTimeout(() => {
      if (this.ubicacion == null) {
        this.geo = this.placeSvc.useLocation;
        localStorage.setItem('geolocalizar', JSON.stringify(this.geo));
      } else {
        localStorage.removeItem('geolocalizar');
        this.ubicacion = localStorage.getItem('geolozalizar');
      }
    }, 2000);

    this.gameService.geEn().subscribe(
      res => {
        console.log(res),
          this.Enc = res
      },
      rep => console.error
    );

    this.gameService.gePar().subscribe(
      res => {
        console.log(res),
          this.Par = res
      },
      rep => console.error
    );
    this.gameService.geEst().subscribe(
      res => {
        console.log(res),
          this.Est = res
      },
      rep => console.error
    );

    this.activateRouter.snapshot.params;
    if (this.activateRouter.snapshot.params['id']) {
      this.gameService.getacti(this.activateRouter.snapshot.params['id'])
        .subscribe(
          res => {
            console.log(res)
            console.log(this.activateRouter.snapshot.params['id'])
            this.activities = res;
            this.edit = true;
          },
          err => console.error(err)
        )
    }
  }

  @HostBinding('class') classes = 'row';

  activities: Activities = {
    idActividad: undefined,
    Nombre_Actividad: '',
    Descripcion: '',
    Encargado: undefined,
    Participante: undefined,
    Estatus: '',
    Fecha_de_inicio: undefined,
    Fecha_de_fin: undefined,
    Lugar: ''
  };

  edit: boolean = false;
  savenewactividad() {
    console.log(this.activities);
    this.gameService.saveact(this.activities)
      .subscribe(
        res => {
          console.log(res);
          
          alert(this.activities.Lugar)
          /**
          if (this.activities.Lugar == '') {
            this.changeLugar('21.168709834371708, -100.93142807890231')
          }
           */
          //alert(this.activities.Lugar)
          this.router.navigate(['/gestion']);
        },
        err => console.error(err)
      )
  }

  updateAct() {
    if (this.activities.idActividad !== undefined) {
      this.gameService.updateact(this.activities.idActividad, this.activities)
        .subscribe(
          res => {
            console.log(res);
            this.router.navigate(['/gestion']);
          },
          err => console.error(err)
        );
    } else {
      console.error("idActividad is undefined");
    }
  }


  geo: any;
  map: any;
  ubicacion: any;
  contador = 0;
  @ViewChild('map') mapContainer: ElementRef | undefined;
  marker?: L.Marker;
  staticMarker?: L.Marker

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
          this.activities.Lugar = `${(latLng as L.LatLng).lat}, ${(latLng as L.LatLng).lng}`;
          console.log(this.activities.Lugar)
          console.log(`Nueva posición del marcador: ${this.marker?.getLatLng().lat}, ${this.marker?.getLatLng().lng}`);
        });
      } else {
        this.marker.setLatLng(latLng);
      }
    }

   
  }
  
  private calculateRoute(start: L.LatLngExpression, end: L.LatLngExpression): void {
    console.log(end)
    L.Routing.control({
      waypoints: [L.latLng(start), L.latLng(end)],
      routeWhileDragging: true
    }).addTo(this.map);
  }

  /*
  ngAfterViewInit() {
    let previousMarker: Marker;

    setTimeout(() => {
      this.ubicacion = localStorage.getItem('geolocalizar');
      this.map = new Map('map').setView(JSON.parse(this.ubicacion), 13);

      tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
      this.map.on('click', (e: { latlng: any; }) => {
        const latlng = e.latlng;
        const marker = L.marker(latlng);

        console.log(latlng.lat, latlng.lng);

        this.map.addLayer(marker);

        if (previousMarker) {
          previousMarker.remove();
        }

        if (this.activities.Lugar == '') {
          this.changeLugar('21.168709834371708, -100.93142807890231')
        }
        previousMarker = marker;

        this.changeLugar(`${(latlng.lat).toFixed(6)}, ${(latlng.lng).toFixed(6)}`)
      });

    }, 2000);
  }

  ubicar() {
    setTimeout(() => {
      marker(this.geo).addTo(this.map).bindPopup("<strong>Esta es tu ubicación</strong>").openPopup();
    }, 2000);
    
    this.changeLugar(this.geo)
    
    routing.control({
      waypoints: [
        latLng(this.geo),
        
      ]
    }).addTo(this.map);
    
  }

  recargar() {
    location.reload();
  }
    */

}
