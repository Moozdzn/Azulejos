import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";

import { Observable as RxObservable } from 'rxjs';

import { openUrl } from "tns-core-modules/utils/utils";

import * as http from "tns-core-modules/http";
import { UrlService } from "../../shared/url.service"

import { device } from '@nativescript/core/platform';

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
        public localizacao,
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

    public relatedTiles: boolean = false;


    public constructor(private params: ModalDialogParams,
        private _url: UrlService) {
        this.docs = JSON.parse(params.context.r);
        console.log(this.docs)
    }

    ngOnInit(): void { }

    public onPageLoad() {
        for (var i = 0; i < this.docs.nrImages; i++) {
            this.array.push(i);
        }
        this.tile = new TileItem(this.docs.id, this.docs.Nome, this.docs.Info, this.docs.Ano, this.docs.Condicao,this.docs.Localizacao.coordinates, this.docs.Sessao, this.docs.nrImages)
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
                    if (r.docs[i].Nome != this.tile.name) {
                        this.items.push(new SessionItem(r.docs[i]._id, r.docs[i].Nome));
                        this.relatedTiles = true;
                    }
                }
            })
        }
    }

    onItemTap(args): void {
        this.closeModal(this.items[args.index].id)
    }

    public closeModal(ID) {
        this.params.closeCallback(ID);
    }

    openGmaps() {
        openUrl("https://www.google.com/maps/dir/?api=1&destination="+this.tile.localizacao[1]+","+this.tile.localizacao[0]+"&travelmode=walking");
    }
}


