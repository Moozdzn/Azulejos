import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { action, ActionOptions } from "tns-core-modules/ui/dialogs";

import * as http from "tns-core-modules/http";
import { ItemEventData, iosEstimatedRowHeightProperty } from "tns-core-modules/ui/list-view"
import { Observable as RxObservable } from 'rxjs';

import { UrlService } from "../shared/url.service";
import { TileDetailComponent } from "../mapa/tile-detail/tile-detail";

export class SessionItem {
    constructor(public id: string,
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

    private id = "5e8b49d6343d6d38c8d96d6b";
    public myItems: RxObservable<Array<SessionItem>>;
    public items = [];
    public state = {
        public: 0,
        submitted: 0,
        inAnalysis: 0
    };

    constructor(private _url: UrlService,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef) {
        // Use the constructor to inject services.
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        var subscr;
        this.myItems = RxObservable.create(subscriber => {
            subscr = subscriber;
            subscriber.next(this.items);
            return function () {
                console.log("Unsubscribe called!!!");
            }
        });
        http.getJSON(this._url.getUrl() + "user/" + this.id + "/sessoes").then((r: any) => {
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
        })
    }

    onItemTap(args: ItemEventData): void {
        if (this.items[args.index].estado === 'PÚBLICA') {
            
            var actions = [];
            for (var i in this.items[args.index].tiles) {
                actions.push(this.items[args.index].tiles[i].Nome)
            }
            let options = {
                title: "Azulejos",
                message: "Selecione um azulejo para ver as informações",
                cancelButtonText: "Cancelar",
                actions: actions
            };

            action(options).then((result) => {
                if (result != "Cancelar") {
                    
                    let found = actions.indexOf(result)
                   
                    this.openDetails(this.items[args.index].tiles[i]._id)
                }
            });
        }
        else if (this.items[args.index].estado === 'ANALISADA') {
            alert('A sua submissão está a ser analisada por um dos nosso especialistas.')
        }
        else {
            alert('A sua submissão aguarda análise dos nossos especialistas.');
        }
    }
    public openDetails(ID) {
        http.getJSON(this._url.getUrl() + "sessoes/" + ID).then((r: any) => {
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
}