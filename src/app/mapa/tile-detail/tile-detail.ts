import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/directives/dialogs";

import { Observable as RxObservable } from 'rxjs';

import * as http from "tns-core-modules/http";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
import { UrlService } from "../../shared/url.service"


export class SessionItem {
    constructor(public id: string, public name: string) { }
}

@Component({ selector: "tile-modal", templateUrl: "tile-detail.html", styleUrls: ["./tile-detail.css"] })

export class TileDetailComponent implements OnInit {
    public id: string;
    public name: string;
    public info: string;
    public ano: string;
    public condicao: string;
    public sessao: string;
    public myItems: RxObservable<Array<SessionItem>>;
    public items = [];
    public array = [];

    public docs: any;


    public constructor(private params: ModalDialogParams,
        private modal: ModalDialogService,
        private vcRef: ViewContainerRef,
        private _url: UrlService) {
        this.docs = params.context.r;
        for (var i = 0; i < this.docs.nrImages; i++) {
            this.array.push(i);
        }
    }

    ngOnInit(): void {}

    public onPageLoad() {
        this.name = this.docs.Nome;
        this.info = this.docs.Info;
        this.ano = this.docs.Ano;
        this.condicao = this.docs.Condicao;
        this.sessao = this.docs.Sessao;
        if (this.sessao != undefined) {
            var subscr;
            this.myItems = RxObservable.create(subscriber => {
                subscr = subscriber;
                subscriber.next(this.items);
                return function () {
                    console.log("Unsubscribe called!!!");
                }
            });
            http.getJSON(this._url.getUrl() + this.sessao + "/azulejos/nome").then((r: any) => {
                for (var i in r.docs) {
                    if (r.docs[i].Nome != this.name) this.items.push(new SessionItem(r.docs[i]._id, r.docs[i].Nome));
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

    public openDetails(ID) {
        http.getJSON(this._url.getUrl() + ID).then((r: any) => {
            let options = {
                context: { r },
                fullscreen: true,
                viewContainerRef: this.vcRef,
            };
            this.modal.showModal(TileDetailComponent, options).then(() => {
            });
        })
    }

}


