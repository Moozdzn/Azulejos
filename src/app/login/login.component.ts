import { Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { RouterExtensions } from "nativescript-angular/router";

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
    @ViewChild("password", {static: false}) password: ElementRef;

    constructor(private page: Page, 
        private routerExtension: RouterExtensions, private _url: UrlService) {
        this.user = new User();
        this.user.username = "Hugo";
        this.user.password = "1234";
        if(hasKey("id") && hasKey("username")){
            this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
        }
    }

    onAuthorize() {
        // Navigate to welcome page with clearHistory
        this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
    }

    login() {
        this._url.login({username: this.user.username,password: this.user.password}).then((r:any)=>{
            const auth = JSON.parse(r.content);
            if(r.statusCode === 200){
                setString("id",auth._id);
                setString("username",auth.username);
                this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
            } else{
                alert("Credentials don't match");
            }
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

