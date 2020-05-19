import { Injectable } from "@angular/core";

import * as http from "tns-core-modules/http";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";

@Injectable({
    providedIn: "root"
})
export class UrlService {
    private serverUrl = "http://192.168.1.9:3000/api/"

    private userID: string = "5e8b49d6343d6d38c8d96d6b";

    private currentUserLocation;

    getUrl(): string {
        return this.serverUrl;
    }
    getUserLocation() {
        return this.currentUserLocation;
    }
    getID(): string {
        return this.userID;
    }
    setID(newID) {
        this.userID = newID;
    }

    async getUserSubmissions() {
        const response = await http.getJSON(this.serverUrl + "user/" + this.userID + "/sessoes");
        return response;
    }
    async submitTiles(body) {
        var httpOptions = {
            url: this.serverUrl + "sessoes",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            content: JSON.stringify(body)
        }

        const response = await http.request(httpOptions)
        return response;
    }

    async getTilesNearUser(location) {
        const response = await http.getJSON(this.serverUrl + "sessoes/azulejos?lat=" + location.lat + "&lng=" + location.lng);
        return response;
    }

    async getTilesName() {
        const response = http.getJSON(this.serverUrl + "sessoes/azulejos/nome");
        return response;
    }
    async getTileInfo(tileID) {
        const response = http.getJSON(this.serverUrl + "sessoes/" + tileID);
        return response;
    }

    checkUserLocation = setInterval(() => {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.currentUserLocation = { lat: location.latitude, lng: location.longitude }
            })
        })
    }, 30000);
}