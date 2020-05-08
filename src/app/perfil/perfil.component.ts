import { Component, OnInit } from "@angular/core";
import * as fs from "tns-core-modules/file-system"
import {login,LoginOptions,LoginResult} from "tns-core-modules/ui/dialogs";

@Component({
    selector: "Perfil",
    templateUrl: "./perfil.component.html"
})

export class PerfilComponent implements OnInit {

    constructor() {
        // Use the constructor to inject services.
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        
    }

    ngAfterViewInit(){

        /* if(!this.credentialsExist()){
            let options: LoginOptions = {
                title: "Login Form",
                message: "Enter your credentials",
                okButtonText: "Login",
                cancelButtonText: "Cancel",
                neutralButtonText: "Neutral",
                userNameHint: "Enter your username",
                passwordHint: "Enter your password",

            };
            
            login(options).then((loginResult: LoginResult) => {
                console.log(loginResult);
            });
        } */
    }

    credentialsExist(){
        var documents = fs.knownFolders.documents();
        var myPath = fs.path.join(documents.path, "credentials.txt");
        let exists = fs.File.exists(myPath);
        console.log("Does credentials.txt exists: " + exists);
        return exists
    }
    

}
