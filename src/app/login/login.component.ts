import { Component, ElementRef, ViewChild } from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import * as http from "tns-core-modules/http";

import {UrlService} from "../shared/url.service";



export class User {
    username: string;
    password: string;
    confirmPassword: string;
}

@Component({
    moduleId: module.id,
    selector: "login-page",
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})

export class LoginComponent {

    user: User;
    processing = false;
    @ViewChild("password", {static: false}) password: ElementRef;

    constructor(private page: Page, 
        private routerExtension: RouterExtensions, private _url: UrlService) {
        this.user = new User();
        this.user.username = "Moozdzn";
        this.user.password = "1234";
    }

    onAuthorize() {
        // Navigate to welcome page with clearHistory
        
        this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
    }

    login() {
        http.request({
            url: this._url.getUrl() + "user",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            content: JSON.stringify({
                username: this.user.username,
                password: this.user.password
            })
        }).then((r: any) => {
            if(r.statusCode == 404) alert('User not found')
            else if(r.statusCode == 200) {
                this.onAuthorize();
            };
                
        }, (e) => {
            console.log(e)
        })
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    

    alert(message: string) {
        return alert({
            title: "APP NAME",
            okButtonText: "OK",
            message: message
        });
    }
    
}

