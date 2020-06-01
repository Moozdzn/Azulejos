import { Component, OnInit } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";

import { openUrl } from "tns-core-modules/utils/utils";

import * as http from "tns-core-modules/http";
import { UrlService } from "../../shared/url.service"

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
        public nrImages: string) {}
}
@Component({ selector: "tile-modal", templateUrl: "tile-detail.html", styleUrls: ["./tile-detail.css"] })

export class TileDetailComponent implements OnInit {
    public myItems: Array<SessionItem>;
    public array = [];
    public docs: any;
    public tile: TileItem;
    public relatedTiles: boolean = false;
    public processing: boolean = true;

    public constructor(private params: ModalDialogParams, private _url: UrlService) {
        this.myItems = [];
        this.array = [];
        this._url.getTileInfo(params.context.ID).then((r:any) => {
            this.docs = JSON.parse(r)
            for (var i = 0; i < this.docs.nrImages; i++) {
                this.array.push(i);
            }
            this.tile = new TileItem(this.docs.id, this.docs.Nome, this.docs.Info, this.docs.Ano, this.docs.Condicao,this.docs.Localizacao.coordinates, this.docs.Sessao, this.docs.nrImages)
            console.log(this.docs)
            if (this.tile.sessao != undefined) {
                this._url.getRelatedTiles(this.tile.sessao).then((r: any) => {
                    console.log(r);
                    for (var i in r.docs) {
                        if (r.docs[i].Nome != this.tile.name) {
                            this.myItems.push(new SessionItem(r.docs[i]._id, r.docs[i].Nome));
                            this.relatedTiles = true;
                        }
                    }
                })
            }
            this.processing = false;
        })
    }

    ngOnInit(): void { 
        console.log(this.relatedTiles);
    }

    onItemTap(args): void {
        this.closeModal(this.myItems[args.index].id)
    }

    public closeModal(ID) {
        this.params.closeCallback(ID);
    }

    openGmaps() {
        openUrl("https://www.google.com/maps/dir/?api=1&destination="+this.tile.localizacao[1]+","+this.tile.localizacao[0]+"&travelmode=walking");
    }
}

