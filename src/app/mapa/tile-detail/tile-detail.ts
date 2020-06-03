// Angular Modules
import { Component } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";
// NativeScript Core Modules
import { openUrl } from "tns-core-modules/utils/utils";
// Azulejos Services
import { UrlService } from "../../shared/url.service";
import { Session, Tile } from "../../shared/azulejos.models";

@Component({ 
    selector: "tile-modal", 
    templateUrl: "tile-detail.html", 
    styleUrls: ["./tile-detail.css"] })

export class TileDetailComponent {
    private tileSession: Array<Session> = [];
    private images = [];
    private docs: any;
    private tile: Tile;
    private relatedTiles: boolean = false;
    private processing: boolean = true;
    private isInfoTranslated: boolean = false;
    private isTranslated: boolean = true;
    private originalInfo:string;

    public constructor(private params: ModalDialogParams, private _url: UrlService) {
        this.docs = params.context.ID;
    }

    private onModalLoaded(): void{
        this._url.requestTileInfo(this.docs).then((r:any) => {
            this.docs = JSON.parse(r)
            for (var i = 0; i < this.docs.nrImages; i++) {
                this.images.push(i);
            }
            if(this.docs.Info !== this.docs.InfoOriginal){
                this.isInfoTranslated = true;
                this.originalInfo = this.docs.InfoOriginal;
            }
            this.tile = new Tile(this.docs.id, this.docs.Nome, this.docs.Info, this.docs.Ano, this.docs.Condicao,this.docs.Localizacao.coordinates, this.docs.Sessao, this.docs.nrImages)
            if (this.tile.session != undefined) {
                this._url.requestRelatedTiles(this.tile.session).then((r: any) => {
                    for (var i in r.docs) {
                        if (r.docs[i].Nome != this.tile.name) {
                            this.tileSession.push(new Session(r.docs[i]._id, r.docs[i].Nome,null,null,null));
                            this.relatedTiles = true;
                        }
                    }
                })
            }
            this.processing = false;
        })
    }

    private toggleTranslation(): void{
        this.tile.info = [this.originalInfo, this.originalInfo = this.tile.info][0];
        this.isTranslated = !this.isTranslated; 
    }

    private openGmaps(): void {
        openUrl("https://www.google.com/maps/dir/?api=1&destination="+this.tile.location[1]+","+this.tile.location[0]+"&travelmode=walking");
    }

    private onItemTap(args): void {
        this.closeModal(this.tileSession[args.index].id)
    }

    private closeModal(ID): void {
        this.params.closeCallback(ID);
    }
}

