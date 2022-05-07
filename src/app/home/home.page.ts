import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  @ViewChild('map') mapRef: ElementRef;

   map: google.maps.Map;
   center = new google.maps.LatLng(-22.489371455524722, -48.546544406633046);
   coordinates: Position;
   private autocomplete = new google.maps.places.AutocompleteService();
   private directions = new google.maps.DirectionsService();
   private directionsRender = new google.maps.DirectionsRenderer();

   listaEnderecos = [];

  constructor() {}

  initMap(): void {
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
      center: this.center,
      zoom: 15
    });

    
  }

  ngOnInit(): void {
      this.initMap();
      this.buscarPosicao();
  }

  async buscarPosicao(){
    this.coordinates = await Geolocation.getCurrentPosition();
    this.irParaPosicao();
  }

  irParaPosicao(){
    this.center = new google.maps.LatLng(this.coordinates.coords.latitude, this.coordinates.coords.longitude);
    this.map.setCenter(this.center);
    this.map.setZoom(18);
    new google.maps.Marker({
      position: this.center,
      map :this.map,
      title: "Hello World!",
      animation: google.maps.Animation.DROP
    });
  }

  
  buscarEndereco(campoBusca: any){
    const busca = campoBusca.target.value as string;

    if(!busca.trim().length){
      this.listaEnderecos = [];
      return false;
    }

    this.autocomplete.getPlacePredictions({input: busca}, (listaLocais) =>{
      console.log(listaLocais);
      this.listaEnderecos = listaLocais;
    });
  }

  public tracarRota(local: google.maps.places.AutocompletePrediction){
    this.listaEnderecos = [];
    new google.maps.Geocoder().geocode({address: local.description},(resultado) =>{
      const marker = new google.maps.Marker({
        position: resultado[0].geometry.location,
        title: resultado[0].formatted_address,
        animation: google.maps.Animation.DROP,
        map: this.map
      });

      const rota: google.maps.DirectionsRequest = {
        origin: this.center,
        destination: resultado[0].geometry.location,
        unitSystem: google.maps.UnitSystem.METRIC,
        travelMode: google.maps.TravelMode.DRIVING
      }

      this.directions.route(rota,(result, status) =>{
        if(status == 'OK'){
          this.directionsRender.setMap(this.map);
          this.directionsRender.setOptions({suppressMarkers: true});
          this.directionsRender.setDirections(result);
        }
      })

    });
  }


}
