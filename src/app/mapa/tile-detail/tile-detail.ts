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
    public myItems: Array<Session>;
    public array = [];
    public docs: any;
    public tile: Tile;
    public relatedTiles: boolean = false;
    public processing: boolean = true;
    private isInfoTranslated: boolean = false;
    private isTranslated: boolean = true;
    private originalInfo:string;


    public constructor(private params: ModalDialogParams, private _url: UrlService) {
        this.docs = params.context.ID;
    }

    private onModalLoaded(){
        this.myItems = [];
        this.array = [];
        this._url.getTileInfo(this.docs).then((r:any) => {
            this.docs = JSON.parse(r)

            console.log(this.docs)
            for (var i = 0; i < this.docs.nrImages; i++) {
                this.array.push(i);
            }
            if(this.docs.Info !== this.docs.InfoOriginal){
                this.isInfoTranslated = true;
                this.originalInfo = this.docs.InfoOriginal;
            }
            this.tile = new Tile(this.docs.id, this.docs.Nome, this.docs.Info, this.docs.Ano, this.docs.Condicao,this.docs.Localizacao.coordinates, this.docs.Sessao, this.docs.nrImages)
            if (this.tile.session != undefined) {
                this._url.getRelatedTiles(this.tile.session).then((r: any) => {
                    for (var i in r.docs) {
                        if (r.docs[i].Nome != this.tile.name) {
                            this.myItems.push(new Session(r.docs[i]._id, r.docs[i].Nome,null,null,null));
                            this.relatedTiles = true;
                        }
                    }
                })
            }
            this.processing = false;
        })
    }

    private onItemTap(args): void {
        this.closeModal(this.myItems[args.index].id)
    }

    public closeModal(ID) {
        this.params.closeCallback(ID);
    }

    private openGmaps() {
        openUrl("https://www.google.com/maps/dir/?api=1&destination="+this.tile.location[1]+","+this.tile.location[0]+"&travelmode=walking");
    }
    toggleTranslation(){
        this.tile.info = [this.originalInfo, this.originalInfo = this.tile.info][0];
        this.isTranslated = !this.isTranslated; 
    }
}

