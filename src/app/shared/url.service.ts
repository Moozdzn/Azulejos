import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class UrlService{
    private serverUrl = "http://192.168.1.9:3000/api/"

    private userID:string = "5e8b49d6343d6d38c8d96d6b";

    getUrl(): string {
        return this.serverUrl;
    }
    getID(): string {
        return this.userID;
    }
    setID(newID){
        this.userID = newID; 
    }

}