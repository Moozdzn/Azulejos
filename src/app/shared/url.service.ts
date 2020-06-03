import { Injectable } from "@angular/core";

import * as http from "tns-core-modules/http";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
import { device } from '@nativescript/core/platform';
import { getString,setString,hasKey,remove } from "tns-core-modules/application-settings";

@Injectable({
    providedIn: "root"
})
export class UrlService {
    private serverUrl = "http://192.168.1.14:3000/api/"
    //private serverUrl = "https://azueljos.herokuapp.com/api/"

    private currentUserLocation;

    getUrl(): string {
        return this.serverUrl;
    }
    getUserLocation() {
        return this.currentUserLocation;
    }
    getUserCurrentLocation(){
        return this.currentUserLocation;
    }


    async requestUserSubmissions() {
        try {
            const response = await http.getJSON(this.serverUrl + "user/" + getString("id") + "/sessoes");
            return response;
        } catch (e) {
            console.log(JSON.stringify(e))
        }

    }
    async submitTiles(body) {
        try {
            var httpOptions = {
                url: this.serverUrl + "sessoes",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                content: JSON.stringify(body)
            }

            const response = await http.request(httpOptions)
            console.log(response);
            return response;
        } catch (e) {
            console.log(JSON.stringify(e))
        }
    }

    async requestTilesNearUser(location, radius) {
        try {
            const response = await http.getJSON(this.serverUrl + "sessoes/azulejos?lat=" + location.lat + "&lng=" + location.lng + "&radius=" + radius);
            return response;
        }
        catch (e) {
            console.log(JSON.stringify(e))
        }
    }

    async requestRelatedTiles(sessionID){
        try{
            const response = await http.getJSON(this.serverUrl + sessionID + "/azulejos/nome");
            return response;
        } catch(e) {
            console.log(JSON.stringify(e));
        }
    }

    async requestTilesName() {
        try {
            const response = await http.getJSON(this.serverUrl + "sessoes/azulejos/nome");
            return response;
        } catch (e) {
            console.log(JSON.stringify(e))
        }

    }
    async requestTileInfo(tileID) {
        try {
            var httpOptions = {
                url: this.serverUrl + "sessoes/" + tileID+"?lan="+device.language,
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
            const response = await http.request(httpOptions);
            if(response.statusCode == 200){
                return response.content
            } return
        } catch (e) {
            console.log(JSON.stringify(e))
        }
    }
    async requestAuth(credentials){
        try{
            var httpOptions = {
                url: this.serverUrl + "user",
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                content: JSON.stringify(credentials)
            }
            const response = await http.request(httpOptions);
            if(response.statusCode == 200){
                var login = response.content.toJSON();
                setString("id",login._id);
                setString("username",login.username);
                return 200
            } else return 404;
        }catch(e){
            console.log(JSON.stringify(e))
        }
    }
    logout(){
        if(hasKey("id")&& hasKey("username")){
            remove("id");
            remove("username");
        }
    }

    private checkUserLocation = setInterval(() => {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                this.currentUserLocation = { lat: location.latitude, lng: location.longitude }
            })
        })
    }, 30000);
}