import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";

import { Observable as RxObservable } from 'rxjs';

import * as http from "tns-core-modules/http";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { UrlService } from "../../shared/url.service"

import { ModalComponent } from "../../submeter/map-modal/map-modal";

export class SessionItem {
    constructor(
        public id: string,
        public name: string) { }
}
export class TileItem {
    constructor(
        public id: string,
        public name: string,
        public info: string,
        public ano: string,
        public condicao: string,
        public sessao: string,
        public nrImages: string) { }
}
@Component({ selector: "tile-modal", templateUrl: "tile-detail.html", styleUrls: ["./tile-detail.css"] })

export class TileDetailComponent implements OnInit {
    public myItems: RxObservable<Array<SessionItem>>;
    public items = [];
    public array = [];

    public docs: any;

    public tile: TileItem;


    public constructor(private params: ModalDialogParams,
        private _url: UrlService) {
        this.docs = params.context.r;

    }

    ngOnInit(): void { }

    public onPageLoad() {
        for (var i = 0; i < this.docs.nrImages; i++) {
            this.array.push(i);
        }
        this.tile = new TileItem(this.docs.id, this.docs.Nome, this.docs.Info, this.docs.Ano, this.docs.Condicao, this.docs.Sessao, this.docs.nrImages)
        if (this.tile.sessao != undefined) {
            var subscr;
            this.myItems = RxObservable.create(subscriber => {
                subscr = subscriber;
                subscriber.next(this.items);
                return function () {
                    console.log("Unsubscribe called!!!");
                }
            });
            http.getJSON(this._url.getUrl() + this.tile.sessao + "/azulejos/nome").then((r: any) => {
                for (var i in r.docs) {
                    if (r.docs[i].Nome != this.tile.name) this.items.push(new SessionItem(r.docs[i]._id, r.docs[i].Nome));
                }
                subscr.next(this.items);
            })
        }
    }

    onItemTap(args): void {
        this.closeModal(this.items[args.index].id)
    }

    public closeModal(ID) {
        this.params.closeCallback(ID);
    }

    seeSession() {

    }
}


