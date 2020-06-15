// Angular Modules
import { Component } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { registerElement } from "nativescript-angular/element-registry";
// NativeScript Core Modules
import { Accuracy } from "tns-core-modules/ui/enums";
// External Packages
import { MapboxMarker, MapboxViewApi } from "nativescript-mapbox-enduco";
import * as geolocation from "nativescript-geolocation";
import { isDarkModeEnabled } from "nativescript-dark-mode";
import { localize } from "nativescript-localize";

registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);

@Component({ selector: "my-modal", templateUrl: "map-modal.html" })
export class ModalComponent {

    private mapbox: MapboxViewApi;
    private locationMarker;
    private darkMode: string = "light";

    constructor(private params: ModalDialogParams) {}

    private ngOnInit(): void {
        if(isDarkModeEnabled()) this.darkMode = "dark";
    }

    private onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                if(this.params.context.marker != null){
                    location.longitude = this.params.context.marker[0];
                    location.latitude = this.params.context.marker[1];
                } 
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude })
                this.locationMarker = <MapboxMarker>{
                    id: 1,
                    lat: location.latitude, 
                    lng: location.longitude, 
                    title: localize("tile.location.marker.title"), 
                    subtitle: localize("tile.location.marker.subtitle"), 
                    selected: true, 
                };
                this.mapbox.addMarkers([this.locationMarker]);
                this.mapbox.setOnMapClickListener((newMarker) => {
                    this.locationMarker.update({ lat: newMarker.lat, lng: newMarker.lng })
                    return true;
                })
            })
        })
    }
    private closeModal(decision) {
        switch (decision){
            case 0:
                geolocation.enableLocationRequest().then(() => {
                    geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                        this.params.closeCallback([location.longitude, location.latitude]);
                    })
                })
                break;
            case 1:
                this.params.closeCallback([this.locationMarker.lng, this.locationMarker.lat]);
                break;
            default:
                console.error('this should not have happened');
        }
    
    }
}
