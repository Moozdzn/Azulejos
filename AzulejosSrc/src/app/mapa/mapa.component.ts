// Angular Modules
import { Component, ViewChild, OnInit, ViewContainerRef, ElementRef } from "@angular/core";
import {registerElement} from "nativescript-angular/element-registry";
import {ModalDialogService} from "nativescript-angular/directives/dialogs";
import {RadAutoCompleteTextViewComponent} from "nativescript-ui-autocomplete/angular";
// NativeScript Core Modules
import {TokenModel} from "nativescript-ui-autocomplete";
import {Accuracy} from "tns-core-modules/ui/enums";
import {setInterval} from "tns-core-modules/timer";
import { Page } from "tns-core-modules/ui/page"
import { getNumber, setNumber, hasKey } from "tns-core-modules/application-settings";
// External Packages
import * as geolocation from "nativescript-geolocation";
import * as Toast from 'nativescript-toast';
import {isDarkModeEnabled} from "nativescript-dark-mode";
import {localize} from "nativescript-localize";
import {MapboxMarker, MapboxViewApi} from "nativescript-mapbox-enduco";
// Azulejos Services
import {UrlService} from "../shared/url.service";
import {TileMarker} from "../shared/azulejos.models";
// Azulejos Components
import {TileDetailComponent} from "./tile-detail/tile-detail";

registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);

@Component({selector: "Mapa", templateUrl: "./mapa.component.html", styleUrls: ['./map.component.css']})
export class MapaComponent implements OnInit {

    private isMap : boolean = true;
    private charCodes = [String.fromCharCode(0xf5a0), String.fromCharCode(0xf03a)];
    
    private icon = this.charCodes[1];
    private darkMode : string = "mapbox_streets";
    private userLocation;
    private tiles : Array < TileMarker >;
    private radius : number = 6;
    private mapbox : MapboxViewApi;
    private settingsDialog;
    private settingsBtn;
    private checkUserPos;
    
    private isSettingsOpened : boolean = false;


    @ViewChild("autocomplete", {static: false}) private autocomplete : RadAutoCompleteTextViewComponent;
    @ViewChild('settingDialog', {static: true}) private dialog : ElementRef;
    @ViewChild('settingBtn', {static: true}) private dialogBtn : ElementRef;

    constructor(private modal : ModalDialogService, 
        private vcRef : ViewContainerRef, 
        private _url : UrlService,
        private _page: Page
        ) {
            this._page.actionBarHidden = true;
        }

    ngOnInit(): void {
        if (isDarkModeEnabled()) {this.darkMode = "dark";}
        if(hasKey('radius')) this.radius = getNumber('radius');
    
        this.settingsDialog = this.dialog.nativeElement;
        this.settingsBtn = this.dialogBtn.nativeElement;

    }

    doAnimation(){
        if(this.isSettingsOpened){
            
            this.settingsBtn.animate({
                rotate: 0,
                duration: 700
            })
            this.settingsDialog.visibility = "collapse";
            this.isSettingsOpened = !this.isSettingsOpened
        } else {
            this.settingsDialog.visibility = "visible";
            this.settingsBtn.animate({
                rotate: 180,
                duration: 700
            })
            this.isSettingsOpened = !this.isSettingsOpened
        }
    }

    ngAfterViewInit(): void {
        this.autocomplete.autoCompleteTextView.loadSuggestionsAsync = () => {
            const promise = new Promise((resolve, reject) => {
                this._url.requestTilesName().then((r : any) => {
                    const tilesCollection = r.docs;
                    const items: Array<TokenModel> = new Array();
                    for (let i = 0; i < tilesCollection.length; i++) {
                        items.push(new TokenModel(tilesCollection[i].Nome, null));
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

    

    private onDidAutoComplete(args) {
        for (var i in this.tiles) {
            if (this.tiles[i].name === args.text) {
                this.openDetails(this.tiles[i].id);
                break;
            }
        }
    }
    onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                
                this.mapbox.setCenter({lat: location.latitude, lng: location.longitude});
                this.userLocation = {
                    lat: location.latitude,
                    lng: location.longitude
                };
                this.setTiles(this.userLocation);
            })
        })
        this.checkUserPos = setInterval(() => {
            geolocation.enableLocationRequest().then(() => {
                geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                    var newLocation = {
                        lat: location.latitude,
                        lng: location.longitude
                    }
                    this.mapbox.getDistanceBetween(this.userLocation, newLocation).then((value : number) => {
                        if (value > 2000) {
                            this.userLocation = newLocation;
                            this.setTiles(this.userLocation);
                            console.log('Getting new markers');
                        } else {
                            console.log('New markers not needed');
                        }
                    })
                })
            })
        }, 60000);
    }

    private setTiles(location) {
        this._url.requestTilesNearUser(location, this.radius).then((r : any) => {
            var markers = [];
            this.tiles = [];
            for (var i in r) {
                this.tiles.push(new TileMarker(r[i]._id, r[i].Nome, [
                    r[i].Localizacao.coordinates[1],
                    r[i].Localizacao.coordinates[0]
                ], (r[i].distance / 1000).toFixed(2) + "km"))
                markers.push(< MapboxMarker > {
                    id: this.tiles[i].id,
                    lat: this.tiles[i].coordinates[0],
                    lng: this.tiles[i].coordinates[1],
                    title: this.tiles[i].name,
                    subtitle: localize('discover.marker.subtitle'),
                    onTap: marker => {
                        this.mapbox.setCenter({lat: marker.lat, lng: marker.lng})
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
        setNumber('radius',this.radius)
        this.setTiles(this.userLocation)
    }

    private centerUser(): void {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                this.setTiles(this.userLocation);
                this.mapbox.setCenter({lat: location.latitude, lng: location.longitude, animated: true})
                var currentUserLocation = {
                    lat: location.latitude,
                    lng: location.longitude
                }
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
}
