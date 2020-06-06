// Angular Modules
import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
// NativeScript Core Modules
import { ImageSource, fromFile } from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";
import { getString } from 'tns-core-modules/application-settings/application-settings';
import { Button } from "tns-core-modules/ui/button";
import { ListViewEventData } from "nativescript-ui-listview";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Accuracy } from "tns-core-modules/ui/enums";
import { EventData } from "tns-core-modules/data/observable";
import { ListPicker } from "tns-core-modules/ui/list-picker";
// External Packages
import * as geolocation from "nativescript-geolocation";
import * as Toast from 'nativescript-toast';
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";
import { localize } from "nativescript-localize";
// Azulejos Services
import { UrlService } from "../shared/url.service";
import { Tile, Session } from "../shared/azulejos.models";
// Azulejos Components
import { TabsComponent } from "../tabs/tabs.component";
import { ModalComponent } from "./map-modal/map-modal";

@Component({
    selector: "Submeter",
    templateUrl: "./submeter.component.html",
    styleUrls: ["./submeter.component.css"]
})
export class SubmeterComponent implements OnInit {

    private _tile: Tile;
    private _session: Session;
    private onEdit: boolean = false;
    private hasSession: boolean = false;
    private conditionPicker: ListPicker;
    private conditions = [localize('tile.conditions.new'), localize('tile.conditions.damaged'), localize('tile.conditions.maintenance'), localize('tile.conditions.restored')]
    
    tap(){
        alert(JSON.stringify(this._tile));
    }
    private onSelectedIndexChanged(args: EventData) {
        const picker = <ListPicker>args.object;
        this._tile.condition = this.conditions[picker.selectedIndex];
    }

    editTile(i){
        this.onEdit = true;
        this.hasSession = false;
        this._tile = this._session.tiles[i];
    }
    deleteTile(i){
        alert(i);
    }

    private ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
        s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    private submittedTiles = [];
    private sessionID = this.ObjectId();
    private imageArray = [];
    private file: string;
    private processing = false;
    private darkenStack;

    constructor(
        private modal: ModalDialogService, 
        private vcRef: ViewContainerRef, 
        private _url: UrlService, 
        private _tabComponent: TabsComponent) {
            this._session = new Session(this.ObjectId(),"","","SUBMETIDA",[])
            this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
        }

    ngOnInit(): void { }

    private showModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(ModalComponent, options).then(res => {
            this._tile.location = res;
        });
    }
    
    private displayConditionOptions() {
        let options = {
            title: localize("tile.conditions.dialog.title"),
            message: localize("tile.conditions.dialog.message"),
            cancelButtonText: localize("tile.conditions.dialog.cancel"),
            actions: [localize('tile.conditions.new'), localize('tile.conditions.damaged'), localize('tile.conditions.maintenance'), localize('tile.conditions.restored')]
        };

        dialogs.action(options).then((result) => {
            if (result !== options.cancelButtonText && result !== options.title){
                this._tile.condition = result;
            }       
        });
    }

    private onSelectSingleTap() {
        let context = imagepicker.create({ mode: "multiple" });
        this.startSelection(context);
    }

    private startSelection(context) {
        let that = this;
        context.authorize().then(() => {
            return context.present();
        }).then((selection) => {
            if (selection.length > 0) {
                for (var i in selection) {
                    //that.imageArray.push(selection[i]._android)
                    that._tile.nrImages.push(selection[i]._android)
                }
            }
        }).catch(function (e) {
            console.log(e);
        });
    }

    private takePhoto() {
        if (camera.isAvailable()) {
            camera.requestCameraPermissions().then(() => {
                camera.takePicture().then((imageAsset) => {
                    console.log("Result is an image asset instance");
                    //this.imageArray.push(imageAsset.android);
                    this._tile.nrImages.push(imageAsset.android);
                }).catch((err) => {
                    console.log("Error -> " + err.message);
                });
            }, () => alert('permissions rejected'))
        }
    }
    
    private onItemSelected(args: ListViewEventData) {
        let options = {
            title: "Pretende remover a imagem selecionada?",
            okButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }
        dialogs.confirm(options).then(result => {
            if(result){
                const listview = args.object;
                const selectedItems = listview.getSelectedItems();
                //const index = this.imageArray.indexOf(selectedItems[0]);
                //this.imageArray.splice(index,1);
                const index = this._tile.nrImages.indexOf(selectedItems[0]);
                this._tile.nrImages.splice(index,1);
            }
        });
    }

    //TODO VALIDAR INPUTS NO ADDANOTHER E NO PROCEED
    //FAZER A VERIFICACAO SE O UTILIZADOR ESCOLHEU LOCALIZAÇÃO
    //NO SUBMIT FAZER UM LOOP PARA CONVERTER AS IMAGENS
    //REMOVER AZULEJOS

    private onAddAnother(){
        if(!this.onEdit){
            this._session.tiles.push(this._tile);
        }
        this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
    }
    private onSaveAndProceed(){
        //this.hasSession=!this.hasSession
        if(!this.errorTileName && !this.errorTileInfo && !this.errorTileYear){
            if(this._tile.nrImages.length <= 0){
                this.errorTileImages =!this.errorTileImages;
            }
        }

    }
    private onSubmit(){
        alert(this._session)
    }

    private imagesToBase64() {
        var imagesToSubmit = [];

        for (var i in this.imageArray) {
            this.file = fs.path.normalize(this.imageArray[i]);
            const ImageFromFilePath: ImageSource = <ImageSource>fromFile(this.file);
            var ImageData = ImageFromFilePath.toBase64String("jpg");
            imagesToSubmit.push(ImageData);
        }
        return imagesToSubmit;
    }

    private goToMap(){
        this._tabComponent.onTabSelect("tab"+0)
    }
    private errorSessionName = false;
    private errorTileName = false;
    private errorTileInfo = false;
    private errorTileYear = false;
    private errorTileImages = false;
    NameChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileName = true;
        } else {
            this.errorTileName = false;
        }
    }
    InfoChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileInfo = true;
        } else {
            this.errorTileInfo = false;
        }
    }
    YearChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileYear = true;
        } else {
            this.errorTileYear = false;
        }
    }
    SessionNameChanged(args){
        console.log(args)
        if(args === "") {
            this.errorSessionName = true;
        } else {
            this.errorSessionName = false;
        }
    }
}

