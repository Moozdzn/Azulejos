import { Component, ViewChild, OnInit, ViewContainerRef, AfterViewInit } from "@angular/core";
import { Router, NavigationExtras } from "@angular/router";

import * as geolocation from "nativescript-geolocation";
import * as Toast from 'nativescript-toast';

import { Mapbox, MapboxMarker, MapboxViewApi } from "nativescript-mapbox-enduco";
import { registerElement } from "nativescript-angular/element-registry";


import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { TokenModel } from "nativescript-ui-autocomplete";
import { RadAutoCompleteTextViewComponent } from "nativescript-ui-autocomplete/angular";

import { ObservableArray } from "tns-core-modules/data/observable-array";
import { Accuracy } from "tns-core-modules/ui/enums";
import { setInterval } from "tns-core-modules/timer";

import { UrlService } from "../shared/url.service"

import { TileDetailComponent } from "./tile-detail/tile-detail";

import { Observable as RxObservable } from 'rxjs';
import { isDarkModeEnabled } from "nativescript-dark-mode";
import { localize } from "nativescript-localize";



registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);


//import { DataService, DataItem } from "../shared/data.service";
export class TileItem {
    constructor(public id: string, public name: string, public distance: string) { }
}
@Component({
    selector: "Mapa",
    templateUrl: "./mapa.component.html",
    styleUrls: ['./map.component.css']

})
export class MapaComponent implements OnInit {

    public isMap: boolean = true;
    public isList: boolean = false;
    public darkMode: string = "light";

    //User location
    public userLocation;

    //Tile List View
    public myItems: RxObservable<Array<TileItem>>;
    public tiles;
    //
    private _items: ObservableArray<TokenModel>;
    private markers;

    private radius: number = 6;
    mapbox: MapboxViewApi;

    constructor(
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private _url: UrlService
    ) {
        
     }

    ngOnInit(): void {
         if(isDarkModeEnabled()) this.darkMode = "dark";
    }

    ngAfterViewInit(): void {
        this.autocomplete.autoCompleteTextView.loadSuggestionsAsync = () => {
            const promise = new Promise((resolve, reject) => {
                this._url.getTilesName().then((r: any) => {
                    const tilesCollection = r.docs;
                    const items: Array<TokenModel> = new Array();
                    for (let i = 0; i < tilesCollection.length; i++) {
                        items.push(new TokenModel(tilesCollection[i].Nome, null));
                    }
                    this.markers = r.docs;
                    resolve(items);
                }).catch((err) => {
                    const message = 'Error fetching remote data from ' + this._url.getUrl() + "sessoes/azulejos/nome" + ': ' + err.message;
                    console.log(message);
                    Toast.makeText(message, "short").show();
                    reject();
                });
            });

            return promise;
        };

    }

    @ViewChild("autocomplete", { static: false }) autocomplete: RadAutoCompleteTextViewComponent;

    get dataItems(): ObservableArray<TokenModel> {
        return this._items;
    }
    toggleView(){
        this.isMap = !this.isMap;
        this.isList = !this.isList;
    }

    // When map is ready, focus on user and adds markers to map
    onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude });
                this.userLocation = { lat: location.latitude, lng: location.longitude };
                this.setTiles(this.userLocation);
            })
        })
    }
    // Button to center user
    centerUser(): void {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude })
                var currentUserLocation = { lat: location.latitude, lng: location.longitude }
                this.userLocation = currentUserLocation;
                this.setTiles(this.userLocation);
            })
        })

    }

    onSliderValueChange(args) {
        this.radius = args.value;
        this.setTiles(this.userLocation)
    }
    // Opens view of single tile information
    public openDetails(ID) {
        this._url.getTileInfo(ID).then((r) => {
            let options = {
                context: { r },
                fullscreen: true,
                viewContainerRef: this.vcRef,
            };
            this.modal.showModal(TileDetailComponent, options).then((cb) => {
                if (cb == null) return
                else this.openDetails(cb);
            });
        })
    }

    public onDidAutoComplete(args) { // Does this break?
        for (var i in this.markers) {
            if (this.markers[i].Nome === args.text) {
                this.openDetails(this.markers[i]._id);
                break;
            }
        }
    }

    onItemTap(args) {
        this.openDetails(this.tiles[args.index].id)
    }

    setTiles(location) {
        this._url.getTilesNearUser(location,this.radius).then((r: any) => {
            //Markers array to pass to map
            var markers = [];
            //Array for ListView
            this.tiles=[];
            var subscr;
            this.myItems = RxObservable.create(subscriber => {
                subscr = subscriber;
                subscriber.next(this.tiles);
                return function () {
                    console.log("Unsubscribe called!!!");
                }
            });

            for (var i in r) {
                markers.push(<MapboxMarker>{
                    id: r[i]._id,
                    lat: r[i].Localizacao.coordinates[1],
                    lng: r[i].Localizacao.coordinates[0],
                    title: r[i].Nome,
                    subtitle: localize('discover.marker.subtitle'),
                    onTap: marker => {
                        console.log("Marker tapped with title: '" + marker.title + "'");
                        this.mapbox.setCenter({ lat: marker.lat, lng: marker.lng })
                    },
                    onCalloutTap: marker => this.openDetails(marker.id)
                })
                this.tiles.push(new TileItem(r[i]._id, r[i].Nome, (r[i].distance / 1000).toFixed(2) + "km"));
            }
            this.mapbox.removeMarkers();
            this.mapbox.addMarkers(markers)
            //subscr.next(this.tiles);
        }, (e) => {
            console.error(JSON.stringify(e))
            alert('hello'+e)
        })
    }

    checkUserPos = setInterval(() => {
        var newLocation = this._url.getUserCurrentLocation();
        this.mapbox.getDistanceBetween(this.userLocation, newLocation).then((value: number) => {
            if (value > 2000) {
                this.userLocation = newLocation;
                this.setTiles(this.userLocation);
                console.log('Getting new markers');
            } else {
                console.log('New markers not needed');
            }
        })
    }, 600000);
}
