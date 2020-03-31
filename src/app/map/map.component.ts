import { Component, ViewChild, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import { Mapbox, MapboxMarker, MapboxViewApi} from "nativescript-mapbox-enduco";
import { registerElement } from "nativescript-angular/element-registry";
import { Router, NavigationExtras } from "@angular/router";



import * as http from "tns-core-modules/http";

//TESTES
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { TokenModel } from "nativescript-ui-autocomplete";
import { RadAutoCompleteTextViewComponent } from "nativescript-ui-autocomplete/angular";

registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);

@Component({
    selector: "Map",
    templateUrl: "./map.component.html"
})
export class MapComponent implements OnInit {
    private _items: ObservableArray<TokenModel>;
    private tiles = [{
        "_id": "5e750549ab03535270a2eb12",
        "Nome": "Palácio dos Marques de Fronteira"
    },
    {
        "_id": "5e752079ab03535270a2eb16",
        "Nome": "Casa no Campo de Santa Clara"
    },
    {
        "_id": "5e75209fab03535270a2eb17",
        "Nome": "Fábrica Viúva Lamego"
    },
    {
        "_id": "5e7cd7e6ad7a4937cc9f01c7",
        "Nome": "MARKER TESTE"
    },
    {
        "_id": "5e7cdb19ad7a4937cc9f01c8",
        "Nome": "MARKER TESTE 2"
    }]
    mapbox: MapboxViewApi; 

    constructor( private router: Router) {
        this.initDataItems();
    }
    ngOnInit() {
        
    }
    @ViewChild("autocomplete", { static: false }) autocomplete: RadAutoCompleteTextViewComponent;

    get dataItems(): ObservableArray<TokenModel> {
        return this._items;
    }

    private initDataItems() {
        this._items = new ObservableArray<TokenModel>();

        for (let i = 0; i < this.tiles.length; i++) {
            this._items.push(new TokenModel(this.tiles[i].Nome, undefined));
        }
    }

    public onDidAutoComplete(args) {
        //Does this break?
        for(var i in this.tiles){
            if(this.tiles[i].Nome === args.text) this.openDetails(this.tiles[i]._id)
        }
        alert('No such marker exists');
    }

    // When map is ready, focus on user and adds markers to map
    onMapReady(args){
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(()=>{
            geolocation.getCurrentLocation({desiredAccuracy:Accuracy.high}).then((location)=>{
                this.mapbox.setCenter({
                    lat: location.latitude,
                    lng: location.longitude
                }).then(()=>{
                    http.request({
                        url:"http://192.168.1.11:3000/api/azulejos",
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        content: JSON.stringify({
                            lat: location.latitude,
                            lng: location.longitude
                        })
                    }).then((r)=>{
                        //TRIGGER
                        var data = JSON.stringify(r.content)
                        var json = JSON.parse(data) 
                        var markers = [];
                        for (var i in json.docs) {
                            markers.push(<MapboxMarker>{
                                id: json.docs[i]._id,
                                lat: json.docs[i].Localizacao.coordinates[1],
                                lng: json.docs[i].Localizacao.coordinates[0],
                                title: json.docs[i].Nome,
                                subtitle: 'Carrega para ver mais',
                                onTap: marker => console.log("Marker tapped with title: '" + marker.title + "'"),
                                onCalloutTap: marker => this.openDetails(marker.id)
                            })
                            
                        }
                        this.mapbox.addMarkers(markers).then((s:any)=>{
                        });
                    },(e)=>{
                        console.error(JSON.stringify(e))
                        alert(e)
                    })
                    this.mapbox.getViewport().then(
                        function(result) {
                          //alert("Mapbox getViewport done, result: " + JSON.stringify(result));
                        }
                    )
                })
            })
        })
    
    }
    // Button to center user
    centerUser(): void{
        geolocation.enableLocationRequest().then(()=>{
            geolocation.getCurrentLocation({desiredAccuracy:Accuracy.high}).then((location)=>{
                this.mapbox.setCenter({
                    lat: location.latitude,
                    lng: location.longitude
                })
            })
        })
    }
    // Opens view of single tile information
    openDetails(markerId: string):void{
        let navigationExtras: NavigationExtras = {
            queryParams:{
                "id": markerId
            }
        }
        this.router.navigate(["/details"], navigationExtras)
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
}