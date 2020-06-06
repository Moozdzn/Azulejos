// Angular Modules
import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
// NativeScript Core Modules
import { hasKey } from "tns-core-modules/application-settings";
// External Packages
import * as Toast from 'nativescript-toast';
// Azulejos Services
import { UrlService } from "../shared/url.service";
import { User } from "../shared/azulejos.models";

@Component({
    moduleId: module.id,
    selector: "login-page",
    templateUrl: "./login.component.html",
    styleUrls: ['./login.component.css']
})

export class LoginComponent{

    private user: User;
    private processing: boolean = false;
    private error: boolean = false;

    constructor( 
        private routerExtension: RouterExtensions, private _url: UrlService) {
        this.user = new User();
        this.user.username = "";
        this.user.password = "";
        if(hasKey("id") && hasKey("username")){
            this.routerExtension.navigate(['/tabs/default'], { clearHistory: true });
        }
    }
    
    private login() {
        this.processing = true;
        this._url.requestAuth({username: this.user.username,password: this.user.password}).then((r:number)=>{
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