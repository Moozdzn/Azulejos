import {Component, ViewChild, OnInit, ViewContainerRef} from "@angular/core";

import * as geolocation from "nativescript-geolocation";
import {Accuracy} from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import {Mapbox, MapboxMarker, MapboxViewApi} from "nativescript-mapbox-enduco";
import {registerElement} from "nativescript-angular/element-registry";

import {Router, NavigationExtras} from "@angular/router";

import * as http from "tns-core-modules/http";
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {TokenModel} from "nativescript-ui-autocomplete";
import {RadAutoCompleteTextViewComponent} from "nativescript-ui-autocomplete/angular";
import { Slider } from "tns-core-modules/ui/slider";

import { UrlService } from "../shared/url.service"

import {ModalDialogService} from "nativescript-angular/directives/dialogs";
import {TileDetailComponent} from "./tile-detail/tile-detail";

import { setInterval, clearInterval } from "tns-core-modules/timer";

registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);


//import { DataService, DataItem } from "../shared/data.service";

@Component({
    selector: "Mapa",
    templateUrl: "./mapa.component.html",
    styleUrls: ['./map.component.css']

})
export class MapaComponent implements OnInit {
    //items: Array<DataItem>;

    private _items : ObservableArray < TokenModel >;
    // TO BE REMOVED
    private markers;

    mapbox : MapboxViewApi;

    constructor(
        private modal : ModalDialogService, 
        private vcRef : ViewContainerRef,
        private _url : UrlService
        //private _itemService: DataService
        ) { }

    ngOnInit(): void {
        let that = this;
        this.autocomplete.autoCompleteTextView.loadSuggestionsAsync = function (text) {
            const promise = new Promise(function (resolve, reject) {
                http.getJSON(that._url.getUrl() + "sessoes/azulejos/nome").then(function (r: any) {
                    console.log(r.docs);
                    const airportsCollection = r.docs;
                    const items: Array<TokenModel> = new Array();
                    for (let i = 0; i < airportsCollection.length; i++) {
                        items.push(new TokenModel(airportsCollection[i].Nome, null));
                    }
                    that.markers = r.docs;
                    resolve(items);
                }).catch((err) => {
                    const message = 'Error fetching remote data from ' + that._url.getUrl() + "sessoes/azulejos/nome" + ': ' + err.message;
                    console.log(message);
                    alert(message);
                    reject();
                });
            });

            return promise;
        };
        //this.items = this._itemService.getItems();
    }

    @ViewChild("autocomplete", {static: true})autocomplete : RadAutoCompleteTextViewComponent;

    get dataItems(): ObservableArray < TokenModel > {
        return this._items;
    }

    // When map is ready, focus on user and adds markers to map
    onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                this.mapbox.setCenter({lat: location.latitude, lng: location.longitude}).then(() => {
                    http.request({
                        url: this._url.getUrl() + "sessoes/azulejos?lat=" + location.latitude + "&lng=" + location.longitude,
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).then((r) => { // TRIGGER
                        var data = JSON.stringify(r.content)
                        var json = JSON.parse(data)
                        var markers = [];
                        for (var i in json.docs) {
                            markers.push(< MapboxMarker > {
                                id: json.docs[i]._id,
                                lat: json.docs[i].Localizacao.coordinates[1],
                                lng: json.docs[i].Localizacao.coordinates[0],
                                title: json.docs[i].Nome,
                                subtitle: 'Carrega para ver mais',
                                onTap: marker => {console.log("Marker tapped with title: '" + marker.title + "'");
                                this.mapbox.setCenter({lat: marker.lat,lng: marker.lng})},
                                onCalloutTap: marker => this.openDetails(marker.id)
                            })
                        }
                        this.mapbox.addMarkers(markers).then((s : any) => {});
                    }, (e) => {
                        console.error(JSON.stringify(e))
                        alert(e)
                    })
                })
            })
        })
    }
    // Button to center user
    centerUser(): void {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                this.mapbox.setCenter({lat: location.latitude, lng: location.longitude})
            })
        })
    }
    // Opens view of single tile information
    public openDetails(ID) {
        http.getJSON(this._url.getUrl() +"sessoes/"+ID).then((r:any)=>{
            let options = {
                context: {r},
                fullscreen: true,
                viewContainerRef: this.vcRef,
                
            };
            this.modal.showModal(TileDetailComponent, options).then((cb) => {
                if(cb == 0) return
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

    onSliderValueChange(args) {
        let slider = <Slider>args.object;
        console.log(`Slider new value ${args.value}`);
    }
    /* id = setInterval(() => {
        this.mapbox.removeMarkers();
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                http.request({
                    url: this._url.getUrl() + "sessoes/azulejos?lat=" + location.latitude + "&lng=" + location.longitude,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((r) => { // TRIGGER
                    var data = JSON.stringify(r.content)
                    var json = JSON.parse(data)
                    var markers = [];
                    for (var i in json.docs) {
                        markers.push(< MapboxMarker > {
                            id: json.docs[i]._id,
                            lat: json.docs[i].Localizacao.coordinates[1],
                            lng: json.docs[i].Localizacao.coordinates[0],
                            title: json.docs[i].Nome,
                            subtitle: 'Carrega para ver mais',
                            onTap: marker => {console.log("Marker tapped with title: '" + marker.title + "'");
                            this.mapbox.setCenter({lat: marker.lat,lng: marker.lng})},
                            onCalloutTap: marker => this.openDetails(marker.id)
                        })
                    }
                    this.mapbox.addMarkers(markers).then((s : any) => {});
                }, (e) => {
                    console.error(JSON.stringify(e))
                    alert(e)
                })
        })
    })
    }, 10000); */
}
