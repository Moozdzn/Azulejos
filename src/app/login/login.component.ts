import { Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import * as Toast from 'nativescript-toast';

import {getBoolean,setBoolean,getNumber,setNumber,getString,setString,hasKey,remove,clear} from "tns-core-modules/application-settings";

import {UrlService} from "../shared/url.service";

export class User {
    username: string;
    password: string;
}

@Component({
    moduleId: module.id,
    selector: "login-page",
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})

export class LoginComponent{

    user: User;
    processing = false;
    error = false;

    constructor(private page: Page, 
        private routerExtension: RouterExtensions, private _url: UrlService) {
        this.user = new User();
        this.user.username = "";
        this.user.password = "";
        if(hasKey("id") && hasKey("username")){
            this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
        }
    }
    onAuthorize() {
        // Navigate to welcome page with clearHistory
        this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
    }
    login() {
        this.processing = true;
        this._url.login({username: this.user.username,password: this.user.password}).then((r:number)=>{
            if(r == 200) {
                this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
                this.error = false;
                Toast.makeText("Successfully logged in", "short").show();
            }
            else this.error = true;
            this.processing = false;
        })
    }
}