import { Component, OnInit } from "@angular/core";
import * as http from "tns-core-modules/http";
import { UrlService } from "../shared/url.service"
import { ItemEventData } from "tns-core-modules/ui/list-view"

import { Observable as RxObservable } from 'rxjs';

import {ModalDialogService} from "nativescript-angular/directives/dialogs";
import {TileDetailComponent} from "../mapa/tile-detail/tile-detail";

export class SessionItem{
    constructor(public id: string,
                public data: string, 
                public estado: string,
                public nome:string) { }
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

    constructor(private _url: UrlService,
        private modal : ModalDialogService,) {
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
            http.getJSON(this._url.getUrl()+"user/"+ this.id +"/sessoes").then((r:any)=>{
                for(var i in r.docs){
                    console.log(r.docs[i])
                    this.items.push(new SessionItem(r.docs[i]._id,r.docs[i].data,r.docs[i].estado,r.docs[i].info));
                }
                console.log(this.items)
                subscr.next(this.items);
            })    
    }

    onItemTap(args: ItemEventData): void {
        console.log('Item with index: ' + args.index + ' tapped');

    }
    

}
