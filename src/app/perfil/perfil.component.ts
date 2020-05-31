import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import * as Toast from 'nativescript-toast';

import { action, confirm } from "tns-core-modules/ui/dialogs";

import { ItemEventData } from "tns-core-modules/ui/list-view"

import { UrlService } from "../shared/url.service";
import { TileDetailComponent } from "../mapa/tile-detail/tile-detail";
import { localize } from "nativescript-localize";
import {getString} from "tns-core-modules/application-settings";



export class SessionItem {
    constructor(
        public id: string,
        public data: string,
        public estado: string,
        public nome: string,
        public tiles) { }
}

@Component({
    selector: "Perfil",
    templateUrl: "./perfil.component.html",
    styleUrls: ["./perfil.component.css"]
})

export class PerfilComponent implements OnInit {

    public userSessions;
    public state;
    public username = getString("username");

    constructor(private _url: UrlService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private routerExtension: RouterExtensions) {
        // Use the constructor to inject services.
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        this.loadUserStats();
    }

    onItemTap(args: ItemEventData): void {
        if (this.userSessions[args.index].estado === 'PÚBLICA') {
            var actions = [];
            for (var i in this.userSessions[args.index].tiles) {
                actions.push(this.userSessions[args.index].tiles[i].Nome)
            }
            let options = {
                title: localize("app.name"),
                message: localize("profile.sessiontap.message"),
                cancelButtonText: localize("tile.conditions.dialog.cancel"),
                actions: actions
            };
            action(options).then((result) => {
                if (result != localize("tile.conditions.dialog.cancel")) {
                    this.openDetails(this.userSessions[args.index].tiles[i]._id)
                }
            });
        }
        else if (this.userSessions[args.index].estado === 'ANALISADA') {
            Toast.makeText(localize("profile.alert.analysis"), "short").show();
        }
        else {
            Toast.makeText(localize("profile.alert.submitted"), "short").show();
        }
    }
    public openDetails(ID) {
        this._url.getTileInfo(ID).then((r: any) => {
            let options = {
                context: { r },
                fullscreen: true,
                viewContainerRef: this.vcRef,
            };
            this.modal.showModal(TileDetailComponent, options).then((cb) => {
                if (cb == 0 || cb == null) return
                else this.openDetails(cb);
            });
        })
    }

    public loadUserStats() {
        this.userSessions = [];
        this.state = {
            public: 0,
            submitted: 0,
            inAnalysis: 0
        }
        this._url.getUserSubmissions().then((r: any) => {
            for (var i in r.docs) {
                switch (r.docs[i].estado) {
                    case "PÚBLICA":
                        this.state.public += 1;
                        break;
                    case "ANALISADA":
                        this.state.inAnalysis += 1;
                        break;
                    case "SUBMETIDA":
                        this.state.submitted += 1;
                        break;
                    default:
                        console.log('Wrong value/ New value in db')
                }
                this.userSessions.push(new SessionItem(r.docs[i]._id, r.docs[i].data, r.docs[i].estado, r.docs[i].info, r.docs[i].azulejos))
            }
        });
    }
    public onProfileLoaded() {
        this.loadUserStats();
    }
    public onLogOut(){
        confirm("You sure you want to log out?").then(result => {
            console.log("Dialog result: " + result);
            if(result){
                this._url.logout();
                this.routerExtension.navigate(['/login'], { clearHistory: true });
            }
        });
    }
}