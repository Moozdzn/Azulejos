import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import * as Toast from 'nativescript-toast';

import { action } from "tns-core-modules/ui/dialogs";

import { ItemEventData } from "tns-core-modules/ui/list-view"
import { Observable as RxObservable } from 'rxjs';

import { UrlService } from "../shared/url.service";
import { TileDetailComponent } from "../mapa/tile-detail/tile-detail";
import { localize } from "nativescript-localize";


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

    public myItems: RxObservable<Array<SessionItem>>;
    public items;
    public state;

    constructor(private _url: UrlService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef) {
        // Use the constructor to inject services.
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        this.loadUserStats();
    }

    onItemTap(args: ItemEventData): void {
        if (this.items[args.index].estado === 'PÚBLICA') {

            var actions = [];
            for (var i in this.items[args.index].tiles) {
                actions.push(this.items[args.index].tiles[i].Nome)
            }
            let options = {
                title: localize("app.name"),
                message: localize("profile.sessiontap.message"),
                cancelButtonText: localize("tile.conditions.dialog.cancel"),
                actions: actions
            };

            action(options).then((result) => {
                if (result != localize("tile.conditions.dialog.cancel")) {

                    this.openDetails(this.items[args.index].tiles[i]._id)
                }
            });
        }
        else if (this.items[args.index].estado === 'ANALISADA') {
            
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
        var subscr;
        this.items = [];
        this.state = {
            public: 0,
            submitted: 0,
            inAnalysis: 0
        }
        this.myItems = RxObservable.create(subscriber => {
            subscr = subscriber;
            subscriber.next(this.items);
            return function () {
                console.log("Unsubscribe called!!!");
            }
        });
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
                this.items.push(new SessionItem(r.docs[i]._id, r.docs[i].data, r.docs[i].estado, r.docs[i].info, r.docs[i].azulejos));
            }
            subscr.next(this.items);
        });
    }
    public onProfileUnload() {
        this.loadUserStats();
    }
}