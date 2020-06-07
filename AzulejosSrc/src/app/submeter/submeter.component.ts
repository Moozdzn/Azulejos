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
    private tiles = [];
    private _session: Session;
    private ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
        s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
    private processing = false;
    private onEdit: boolean = false;
    private hasSession: boolean = false;
    private errorSessionName = true;
    private errorTileName = true;
    private errorTileInfo = true;
    private errorTileYear = true;
    private errorTileCondition = true;
    private errorTileImages = true;

    constructor(
        private modal: ModalDialogService, 
        private vcRef: ViewContainerRef, 
        private _url: UrlService, 
        private _tabComponent: TabsComponent) {
            this._session = new Session(this.ObjectId(),"","","SUBMETIDA",getString('id'),[])
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
                    this._tile.nrImages.push(selection[i]._android);
                }
                if(this.errorTileImages) {
                    this.errorTileImages = !this.errorTileImages;
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
                    if(this.errorTileImages) {
                        this.errorTileImages = !this.errorTileImages;
                    }
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
                const index = this._tile.nrImages.indexOf(selectedItems[0]);
                this._tile.nrImages.splice(index,1);
                if(this._tile.nrImages.length == 0) {
                    this.errorTileImages = !this.errorTileImages;
                }
            }
        });
    }

    //TODO VALIDAR INPUTS NO ADDANOTHER E NO PROCEED
    //FAZER A VERIFICACAO SE O UTILIZADOR ESCOLHEU LOCALIZAÇÃO
    //NO SUBMIT FAZER UM LOOP PARA CONVERTER AS IMAGENS
    //REMOVER AZULEJOS

    private onAddAnother(){
        const isValid = this.hasErrors();
        if(isValid){
            if(!this.onEdit){
                this.tiles.push(this._tile);
            } else {
                this.onEdit = !this.onEdit
            }
            this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
            
        } else {
            Toast.makeText('Please fill all field before adding another tile','short').show();
        }
    }
    private onSaveAndProceed(){
        const isValid = this.hasErrors();
        if(isValid){
            if(!this.onEdit){
                this.tiles.push(this._tile);
            } else {
                this.onEdit = !this.onEdit
            }
            this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
            this.hasSession=!this.hasSession;
        } else {
            Toast.makeText('Please fill all field before proceeding','short').show();
        }
    }
    private onSubmit(){
        if(!this.errorSessionName && this.tiles.length > 0){
            this.processing=true;
            for(const i in this.tiles){
                this._session.tiles.push({"_id":this.tiles[i].id,"Nome":this.tiles[i].name})
            }
            for(const i in this._session.tiles){
                   const data = this.imagesToBase64(this.tiles[i].nrImages);
                   this.tiles[i].nrImages = data;
            }
            var body = {
                sessao: this._session,
                azulejos: this.tiles
            }
            this._url.submitTiles(body).then((r)=>{
                this.hasSession = !this.hasSession;
                this.tiles.length = 0;
                this._session = new Session(this.ObjectId(),"","","SUBMETIDA",getString('id'),[])
                this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
                console.log(r);
                this.processing = false;
            });
        } else {
            alert('not valid');
        }
    }

    private imagesToBase64(imagesToConvert) {
        var imagesToSubmit = [];
        var file;
        for (var i in imagesToConvert) {
            file = fs.path.normalize(imagesToConvert[i]);
            const ImageFromFilePath: ImageSource = <ImageSource>fromFile(file);
            var ImageData = ImageFromFilePath.toBase64String("jpg");
            imagesToSubmit.push(ImageData);
        }
        return imagesToSubmit;
    }

    private goToMap(){
        this._tabComponent.onTabSelect("tab"+0)
    }

    private editTile(i){
        this.onEdit = true;
        this.hasSession = false;
        this._tile = this.tiles[i];
    }
    private deleteTile(i){
        dialogs.confirm({
            title: "Delete Tile: "+this.tiles[i].name,
            message: "This action can´t be reverted",
            okButtonText: "Delete",
            cancelButtonText: "Keep",
        }).then(result => {
            // result argument is boolean
            if(result) {
                this.tiles.splice(i,1);
                Toast.makeText('Tile deleted from session','short').show();
            }
            console.log("Dialog result: " + result);
        });  
    }

    private hasErrors(){
        if(!this.errorTileName && !this.errorTileInfo && !this.errorTileYear && !this.errorTileCondition && !this.errorTileImages){
            if(this._tile.location.length == 0){
                geolocation.enableLocationRequest().then(() => {
                    geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                        this._tile.location = [
                            location.longitude,
                            location.latitude    
                        ]
                    })
                })
            }
            return true
        } else {
            return false
        }
    }

    private NameChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileName = true;
        } else {
            this.errorTileName = false;
        }
    }
    private InfoChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileInfo = true;
        } else {
            this.errorTileInfo = false;
        }
    }
    private YearChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileYear = true;
        } else {
            this.errorTileYear = false;
        }
    }
    private ConditionChanged(args){
        console.log(args)
        if(args === "") {
            this.errorTileCondition = true;
        } else {
            this.errorTileCondition = false;
        }
    }
    private SessionNameChanged(args){
        console.log(args)
        if(args === "") {
            this.errorSessionName = true;
        } else {
            this.errorSessionName = false;
        }
    }
    
}

