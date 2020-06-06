// Angular Modules
import { Component } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { registerElement } from "nativescript-angular/element-registry";
// NativeScript Core Modules
import { Accuracy } from "tns-core-modules/ui/enums";

// External Packages
import { Mapbox, MapboxMarker, MapboxViewApi } from "nativescript-mapbox-enduco";
import * as geolocation from "nativescript-geolocation";
import { isDarkModeEnabled } from "nativescript-dark-mode";
import { localize } from "nativescript-localize";

registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);

@Component({ selector: "my-modal", templateUrl: "map-modal.html" })
export class ModalComponent {

    private mapbox: MapboxViewApi;
    public locationMarker;
    public oldCoords;
    public darkMode: string = "light";

    public constructor(private params: ModalDialogParams) {}

    private ngOnInit(): void {
        if(isDarkModeEnabled()) this.darkMode = "dark";
    }

    private onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude })
                this.oldCoords = [location.latitude, location.longitude]
                this.locationMarker = <MapboxMarker>{
                    id: 1,
                    lat: location.latitude, 
                    lng: location.longitude, 
                    title: localize("tile.location.marker.title"), 
                    subtitle: localize("tile.location.marker.subtitle"), 
                    selected: true, 
                };
                this.mapbox.addMarkers([this.locationMarker]);
                this.mapbox.setOnMapClickListener((data) => {
                    this.locationMarker.update({ lat: data.lat, lng: data.lng })
                    console.log(this.locationMarker);
                    return true;
                })
            })
        })
    }
    public closeModal(decision) {
        if (decision == "cancel")
            this.params.closeCallback(this.oldCoords);
        else
            this.params.closeCallback([this.locationMarker.lng, this.locationMarker.lat]);
    }
}
