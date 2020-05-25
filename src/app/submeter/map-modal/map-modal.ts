import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
import { registerElement } from "nativescript-angular/element-registry";

import { Mapbox, MapboxMarker, MapboxViewApi } from "nativescript-mapbox-enduco";
import * as geolocation from "nativescript-geolocation";

import { Accuracy } from "tns-core-modules/ui/enums";
import { isDarkModeEnabled } from "nativescript-dark-mode";



registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);


@Component({ selector: "my-modal", templateUrl: "map-modal.html" })
export class ModalComponent {

    mapbox: MapboxViewApi;
    public locationMarker;
    public oldCoords;
    public darkMode: string = "light";

    public constructor(private params: ModalDialogParams) {}

    ngOnInit(): void {
        if(isDarkModeEnabled()) this.darkMode = "dark";
    }

    onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.mapbox.setCenter({ lat: location.latitude, lng: location.longitude })
                this.oldCoords = [location.latitude, location.longitude]
                this.locationMarker = <MapboxMarker>{
                    id: 1, // can be user in 'removeMarkers()'
                    lat: location.latitude, // mandatory
                    lng: location.longitude, // mandatory
                    title: 'Localizacao azulejo', // recommended to pass in
                    subtitle: 'Pressione outro local para mudar a localização', // one line is available on iOS, multiple on Android
                    selected: true, // makes the callout show immediately when the marker is added (note: only 1 marker can be selected at a time)
                    onTap: function (marker) {
                        console.log("This marker was tapped");
                    },
                    onCalloutTap: function (marker) {
                        console.log("The callout of this marker was tapped");
                    }
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
