import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import {Mapbox, MapboxMarker, MapboxViewApi} from "nativescript-mapbox-enduco";
import { registerElement } from "nativescript-angular/element-registry";


//TESTES
import {getFile, getImage, getJSON, getString, request, HttpResponse, HttpResponseEncoding } from "tns-core-modules/http";
import * as fetch from "tns-core-modules/fetch";


registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);

@Component({
    selector: "Map",
    templateUrl: "./map.component.html"
})
export class MapComponent implements OnInit {

    mapbox: MapboxViewApi; 

    constructor() {
        // Use the component constructor to inject providers.
    }

    ngOnInit(): void {
        // Init your component properties here.
    }

    onMapReady(args){
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(()=>{
            geolocation.getCurrentLocation({desiredAccuracy:Accuracy.high}).then((location)=>{
                this.mapbox.setCenter({
                    lat: location.latitude,
                    lng: location.longitude
                }).then(()=>{
                    request({
                        url:"http://192.168.1.11:3000/api/azulejos",
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        content: JSON.stringify({
                            lat: location.latitude,
                            lng: location.longitude
                        })
                    }).then((r)=>{
                        var data = JSON.stringify(r.content)
                        var json = JSON.parse(data) 
                        console.log(json.docs[0])
                        
                        var markers = [];
                        for (var i in json.docs) {
                            markers.push(<MapboxMarker>{
                                id: i,
                                lat: json.docs[i].Localizacao.coordinates[1],
                                lng: json.docs[i].Localizacao.coordinates[0],
                                title: json.docs[i].Nome,
                                subtitle: 'Carrega para ver mais',
                                onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
                                onCalloutTap: marker => alert("Marker callout tapped with title: '" + marker.title + "'")
                            })
                            
                        }
                        console.log(markers);
                        this.mapbox.addMarkers(markers).then((s:any)=>{
                            console.log("markers added")
                        });
                        console.log(JSON.stringify(r));
                    },(e)=>{
                        console.error(JSON.stringify(e))
                        alert(e)
                    })
                    this.mapbox.getViewport().then(
                        function(result) {
                          //alert("Mapbox getViewport done, result: " + JSON.stringify(result));
                        }
                    )
                })
            })
        })
    
    }

     centerUser(){
     /*   const map = this.mapbox
        map.getUserLocation().then(
            function(userLocation) {
                map.setCenter({
                    lat: userLocation.location.lat,
                    lng: userLocation.location.lng
                })
            }
        )
        //TESTES
        getJSON("https://azueljos.herokuapp.com/api/azulejos").then((r:any) =>{
            var markers = [];
            for (var i in r) {
                markers.push(<MapboxMarker>{
                    id: i,
                    lat: r[i].Coord.coordinates[1],
                    lng: r[i].Coord.coordinates[0],
                    title: r[i].Nome,
                    subtitle: 'Carrega para ver mais',
                    onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
                    onCalloutTap: marker => alert("Marker callout tapped with title: '" + marker.title + "'")
                })
                
            }
            console.log(markers);
            map.addMarkers(markers).then((s:any)=>{
                console.log("markers added")
            });



        },(e) =>{
            console.log(e)
        });*/

    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}
