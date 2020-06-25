// Angular Modules
import { Component, ViewChild, OnInit, ViewContainerRef, ElementRef } from "@angular/core";
import { registerElement } from "nativescript-angular/element-registry";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { RadAutoCompleteTextViewComponent } from "nativescript-ui-autocomplete/angular";
// NativeScript Core Modules
import { TokenModel } from "nativescript-ui-autocomplete";
import { Accuracy } from "tns-core-modules/ui/enums";
import { setInterval } from "tns-core-modules/timer";
import { Page } from "tns-core-modules/ui/page"
import { getNumber, setNumber, hasKey } from "tns-core-modules/application-settings";
// External Packages
import * as geolocation from "nativescript-geolocation";
import * as Toast from 'nativescript-toast';
import { isDarkModeEnabled } from "nativescript-dark-mode";
import { localize } from "nativescript-localize";
import { MapboxMarker, MapboxViewApi } from "nativescript-mapbox-enduco";
// Azulejos Services
import { UrlService } from "../shared/url.service";
import { TileMarker } from "../shared/azulejos.models";
// Azulejos Components
import { TileDetailComponent } from "./tile-detail/tile-detail";

registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);

@Component({ selector: "Mapa", templateUrl: "./mapa.component.html", styleUrls: ['./map.component.css'] })
export class MapaComponent implements OnInit {

    private isMap: boolean = true;
    private charCodes = [String.fromCharCode(0xf5a0), String.fromCharCode(0xf03a)];

    private icon = this.charCodes[1];
    private darkMode: string = "mapbox_streets";
    private userLocation;
    private tiles: Array<TileMarker>;
    private radius: number = 6;
    private mapbox: MapboxViewApi;
    private visibility = "collapsed";
    private settingsBtn;

    private isSettingsOpened: boolean = false;

    @ViewChild("autocomplete", { static: false }) private autocomplete: RadAutoCompleteTextViewComponent;
    @ViewChild('settingBtn', { static: true }) private dialogBtn: ElementRef;

    constructor(private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private _url: UrlService,
        private _page: Page) {
        this._page.actionBarHidden = true;
    }

    ngOnInit(): void {
        if (isDarkModeEnabled()) { this.darkMode = "dark"; }
        if (hasKey('radius')) this.radius = getNumber('radius');
        this.settingsBtn = this.dialogBtn.nativeElement;
    }

    ngAfterViewInit(): void {
        this.autocomplete.autoCompleteTextView.loadSuggestionsAsync = () => {
            const promise = new Promise((resolve, reject) => {
                this._url.requestTilesName().then((r: any) => {
                    const tilesCollection = r.docs;
                    const items: Array<TokenModel> = new Array();
                    for (let i = 0; i < tilesCollection.length; i++) {
                        items.push(new TokenModel(tilesCollection[i].Nome, tilesCollection[i]._id));
                    }
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
    private doAnimation() {
        if (this.isSettingsOpened) {
            this.settingsBtn.animate({ rotate: 0, duration: 700 })
            this.visibility = "collapse";
            this.isSettingsOpened = !this.isSettingsOpened
        } else {
            this.visibility = "visible";
            this.settingsBtn.animate({ rotate: 180, duration: 700 })
            this.isSettingsOpened = !this.isSettingsOpened
        }
    }

    private onDidAutoComplete(args) {
        this.openDetails(args.token.image);
        /* console.log(args.token.image)
        for (var i in this.tiles) {
            if (this.tiles[i].name === args.text) {
                console.log('here')
                this.openDetails(this.tiles[i].id);
                break;
            }
        } */
    }
    private onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude });
                this.userLocation = {
                    lat: location.latitude,
                    lng: location.longitude
                };
                this.setTiles(this.userLocation);
            })
        })
    }

    private setTiles(location) {
        this._url.requestTilesNearUser(location, this.radius).then((r: any) => {
            var markers = [];
            this.tiles = [];
            for (var i in r) {
                this.tiles.push(new TileMarker(r[i]._id, r[i].Nome, [
                    r[i].Localizacao.coordinates[1],
                    r[i].Localizacao.coordinates[0]
                ], (r[i].distance / 1000).toFixed(2) + "km"))
                markers.push(<MapboxMarker>{
                    id: this.tiles[i].id,
                    lat: this.tiles[i].coordinates[0],
                    lng: this.tiles[i].coordinates[1],
                    title: this.tiles[i].name,
                    subtitle: localize('discover.marker.subtitle'),
                    onTap: marker => {
                        this.mapbox.setCenter({ lat: marker.lat, lng: marker.lng })
                    },
                    onCalloutTap: marker => {
                        this.openDetails(marker.id)
                    }
                })
            }
            this.mapbox.removeMarkers();
            this.mapbox.addMarkers(markers)
        }, (e) => {
            console.error(JSON.stringify(e))
        })
    }

    private toggleView() {
        this.isMap = !this.isMap;
        if (this.isMap) {
            this.icon = this.charCodes[1];
        } else {
            this.icon = this.charCodes[0];
        }
    }

    private onSliderValueChange(args) {
        this.radius = args.value;
        setNumber('radius', this.radius)
        this.setTiles(this.userLocation)
    }

    private centerUser(): void {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.setTiles(this.userLocation);
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude, animated: false }).then(() => {
                    this.mapbox.setZoomLevel({ level: 15, animated: false })
                })
                var currentUserLocation = { lat: location.latitude, lng: location.longitude }
                this.userLocation = currentUserLocation;
            })
        })
    }
    private onItemTap(args) {
        this.openDetails(this.tiles[args.index].id)
    }

    private openDetails(ID) {
        let options = {
            context: {
                ID
            },
            fullscreen: true,
            viewContainerRef: this.vcRef,
            animated: true
        };
        this.modal.showModal(TileDetailComponent, options).then((cb) => {
            if (cb == 0 || cb == null)
                return
            else
                this.openDetails(cb);

        });
    }

    private checkUserPos = setInterval(() => {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                var newLocation = {
                    lat: location.latitude,
                    lng: location.longitude
                }
                if (this.distance(this.userLocation.lat, this.userLocation.lng, newLocation.lat, newLocation.lng) > 2) {
                    this.userLocation = newLocation;
                    this.setTiles(this.userLocation);
                    console.log('Getting new markers');
                } else {
                    console.log('New markers not needed');
                }
            })
        })
    }, 30000);

    

    private distance(lat1, lon1, lat2, lon2) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            dist = dist * 1.609344
            console.log(dist)
            return dist;
        }
    }

}
