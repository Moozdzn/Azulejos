import {Component, ViewChild, OnInit} from "@angular/core";
import {RadSideDrawer} from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import * as geolocation from "nativescript-geolocation";
import {Accuracy} from "tns-core-modules/ui/enums"; // used to describe at what accuracy the location should be get
import {Mapbox, MapboxMarker, MapboxViewApi} from "nativescript-mapbox-enduco";
import {registerElement} from "nativescript-angular/element-registry";
import {Router, NavigationExtras} from "@angular/router";
import * as http from "tns-core-modules/http";
import {ObservableArray} from "tns-core-modules/data/observable-array";
import {TokenModel} from "nativescript-ui-autocomplete";
import {RadAutoCompleteTextViewComponent} from "nativescript-ui-autocomplete/angular";


registerElement("Mapbox", () => require("nativescript-mapbox-enduco").MapboxView);
registerElement('Fab', () => require('@nstudio/nativescript-floatingactionbutton').Fab);


@Component({selector: "Map", templateUrl: "./map.component.html", styleUrls: ['./map.component.css']})


export class MapComponent implements OnInit {

    private _items : ObservableArray < TokenModel >;
    private jsonUrl = "http://192.168.0.106:3000/api/sessoes/azulejos/nome";
    // TO BE REMOVED
    public serverURL : string = "http://192.168.0.106:3000/api/sessoes/";
    private markers;

    mapbox : MapboxViewApi;

    constructor(private router : Router) {}
    ngOnInit() {
        let that = this;
        this.autocomplete.autoCompleteTextView.loadSuggestionsAsync = function (text) {
            const promise = new Promise(function (resolve, reject) {
                http.getJSON(that.jsonUrl).then(function (r: any) {
                    console.log(r.docs);
                    const airportsCollection = r.docs;
                    const items: Array<TokenModel> = new Array();
                    for (let i = 0; i < airportsCollection.length; i++) {
                        items.push(new TokenModel(airportsCollection[i].Nome, null));
                    }
                    that.markers = r.docs;
                    resolve(items);
                }).catch((err) => {
                    const message = 'Error fetching remote data from ' + that.jsonUrl + ': ' + err.message;
                    console.log(message);
                    alert(message);
                    reject();
                });
            });

            return promise;
        };
    }

    @ViewChild("autocomplete", {static: true})autocomplete : RadAutoCompleteTextViewComponent;

    get dataItems(): ObservableArray < TokenModel > {
        return this._items;
    }

    // When map is ready, focus on user and adds markers to map
    onMapReady(args) {
        this.mapbox = args.map;
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                this.mapbox.setCenter({lat: location.latitude, lng: location.longitude}).then(() => {
                    http.request({
                        url: this.serverURL + "azulejos?lat=" + location.latitude + "&lng=" + location.longitude,
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).then((r) => { // TRIGGER
                        var data = JSON.stringify(r.content)
                        var json = JSON.parse(data)
                        var markers = [];
                        for (var i in json.docs) {
                            markers.push(< MapboxMarker > {
                                id: json.docs[i]._id,
                                lat: json.docs[i].Localizacao.coordinates[1],
                                lng: json.docs[i].Localizacao.coordinates[0],
                                title: json.docs[i].Nome,
                                subtitle: 'Carrega para ver mais',
                                onTap: marker => {console.log("Marker tapped with title: '" + marker.title + "'");
                                    this.mapbox.setCenter({lat: json.docs[i].Localizacao.coordinates[1],lng: json.docs[i].Localizacao.coordinates[0]})},
                                onCalloutTap: marker => this.openDetails(marker.id)
                            })
                        }
                        this.mapbox.addMarkers(markers).then((s : any) => {});
                    }, (e) => {
                        console.error(JSON.stringify(e))
                        alert(e)
                    })
                    this.mapbox.getViewport().then(function (result) { // alert("Mapbox getViewport done, result: " + JSON.stringify(result));
                    })
                })
            })
        })
    }
    // Button to center user
    centerUser(): void {
        geolocation.enableLocationRequest().then(() => {
            geolocation.getCurrentLocation({desiredAccuracy: Accuracy.high}).then((location) => {
                this.mapbox.setCenter({lat: location.latitude, lng: location.longitude})
            })
        })
    }
    // Button to go to submit view
    goToSubmit(): void {
        this.router.navigate(['/submit-tile']);
    }
    // Opens view of single tile information
    openDetails(markerId : string): void {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                "id": markerId
            }
        }
        this.router.navigate(["/details"], navigationExtras)
    }
    public onDidAutoComplete(args) { // Does this break?
        for (var i in this.markers) {
            if (this.markers[i].Nome === args.text) {
                this.openDetails(this.markers[i]._id);
                break;
            }
        }
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer> app.getRootView();
        sideDrawer.showDrawer();
    }
}
