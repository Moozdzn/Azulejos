// Angular Modules
import { Component, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
// NativeScript Core Modules
import { getString } from "tns-core-modules/application-settings";
import { ItemEventData } from "tns-core-modules/ui/list-view"
import { action, confirm } from "tns-core-modules/ui/dialogs";
// External Packages
import * as Toast from 'nativescript-toast';
import { localize } from "nativescript-localize";
// Azulejos Services
import { UrlService } from "../shared/url.service";
import { Session } from "../shared/azulejos.models";
// Azulejos Components
import { TileDetailComponent } from "../mapa/tile-detail/tile-detail";

@Component({
    selector: "Perfil",
    templateUrl: "./perfil.component.html",
    styleUrls: ["./perfil.component.css"]
})

export class PerfilComponent {

    private userSessions: Array<Session>;
    private state: { public: any; inAnalysis: any; submitted: any; };
    private username: string = getString("username");
    private processing: boolean = true;

    constructor(private _url: UrlService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private routerExtension: RouterExtensions) {
        // Use the constructor to inject services.
    }

    private onProfileLoaded() {
        this.loadUserStats();
    }

    private loadUserStats() {
        this.processing = true;
        this.userSessions = [];
        this.state = {
            public: 0,
            submitted: 0,
            inAnalysis: 0
        }
        this._url.requestUserSubmissions().then((r: any) => {
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
                this.userSessions.push(new Session(r.docs[i]._id,r.docs[i].info, r.docs[i].data, r.docs[i].estado,  r.docs[i].azulejos))
            }
            this.processing = false;
        });
    }

    private onItemTap(args: ItemEventData): void {
        if (this.userSessions[args.index].state === 'PÚBLICA') {
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
        else if (this.userSessions[args.index].state === 'ANALISADA') {
            Toast.makeText(localize("profile.alert.analysis"), "short").show();
        }
        else {
            Toast.makeText(localize("profile.alert.submitted"), "short").show();
        }
    }
    private openDetails(ID) {
        this._url.requestTileInfo(ID).then((r: any) => {
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

    private onLogOut(){
        confirm("You sure you want to log out?").then(result => {
            console.log("Dialog result: " + result);
            if(result){
                this._url.logout();
                this.routerExtension.navigate(['/login'], { clearHistory: true });
            }
        });
    }
}