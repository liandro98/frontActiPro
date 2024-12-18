import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

declare var FB: any; // Declara FB para poder usar el SDK de Facebook

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  correo: string = '';
  password1: string = '';

  constructor(private authService: AuthService, private router: Router) {
    sessionStorage.clear();
  }

  ngOnInit(): void {
    /*
    // Inicializa el SDK de Facebook
    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: '{your-app-id}', // Reemplaza con tu App ID de Facebook
        cookie: true,
        xfbml: true,
        version: 'v13.0' // Asegúrate de usar la versión correcta de la API
      });
    };

    // Cargar el SDK de Facebook
    this.loadFacebookSDK();
    */

    //Inicia nuevo inicio

    FB.getLoginStatus((response: any) => {
      this.statusChangeCallback(response);
    });

    // Termina nuevo inicio
  }
  //Inicia Nuevo inicio

  // Maneja los cambios en el estado de inicio de sesión
  statusChangeCallback2(response: any): void {
    if (response.status === 'connected') {
      console.log('Usuario conectado:', response.authResponse);
      this.fetchUserDetails();
    } else {
      console.log('Usuario no está conectado a Facebook.');
    }
  }

  // Inicia sesión con Facebook
  login2(): void {
    FB.login((response: any) => {
      if (response.status === 'connected') {
        console.log('Inicio de sesión exitoso:', response.authResponse);
        this.fetchUserDetails();
      } else {
        console.error('El usuario no concedió permisos.');
      }
    }, { scope: 'public_profile,email' });
  }

  //Termina nuevo inicio
  // Obtiene los detalles del usuario
  fetchUserDetails(): void {
    FB.api('/me', { fields: 'name,email,picture' }, (userInfo: any) => {
      console.log('Detalles del usuario:', userInfo);
    });
  }



  loadFacebookSDK(): void {
    (function (d, s, id) {
      let js: HTMLScriptElement, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode!.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  login(): void {
    this.authService.loginToServer(this.correo, this.password1).subscribe(response => {
      if (response.length !== 0) {
        this.authService.setLoggendInStatus(true);
        console.log(response);
        this.router.navigate(['/gestion']);
        const sesion = JSON.stringify(response);
        sessionStorage.setItem("usuario", sesion);
        this.authService.setCurrentUser();
      } else {
        alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
      }
    });
  }

  // Método para manejar el inicio de sesión con Facebook
  checkLoginState(): void {
    FB.getLoginStatus((response: any) => {
      this.statusChangeCallback(response);
    });
  }

  statusChangeCallback(response: any): void {
    if (response.status === 'connected') {
      const accessToken = response.authResponse.accessToken;
      console.log('Usuario conectado y autorizado con Facebook.');
      console.log('Access Token:', accessToken);

      // Aquí puedes realizar acciones adicionales, como verificar el usuario en el servidor usando el token.
      this.authService.setLoggendInStatus(true);
      this.router.navigate(['/gestion']);
    } else {
      console.log('Usuario no conectado con Facebook.');
    }
  }
}
