// Angular Modules
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
// NativeScript Core Modules
import { ImageSource, fromFile } from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";
import { getString } from 'tns-core-modules/application-settings/application-settings';
import { ListViewEventData } from "nativescript-ui-listview";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page"
// External Packages
import * as Toast from 'nativescript-toast';
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";
import { localize } from "nativescript-localize";
// Azulejos Services
import { UrlService } from "../shared/url.service";
import { Tile, Session } from "../shared/azulejos.models";
// Azulejos Components
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
    private errorTileLocation = true;

    constructor(
        private modal: ModalDialogService, 
        private vcRef: ViewContainerRef,
        private _page: Page,
        private _url: UrlService) {
            this._page.actionBarHidden = true;
            this._session = new Session(this.ObjectId(),"","","SUBMETIDA",getString('id'),[])
            this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
        }

    ngOnInit(): void { }

    private NameChanged(args){
        if(args === "") {
            this.errorTileName = true;
        } else {
            this.errorTileName = false;
        }
    }
    private InfoChanged(args){
        if(args === "") {
            this.errorTileInfo = true;
        } else {
            this.errorTileInfo = false;
        }
    }

    private YearChanged(args){
        if(args === "") {
            this.errorTileYear = true;
        } else {
            this.errorTileYear = false;
        }
    }
    
    private showLocationModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        if(this._tile.location.length > 0){
            options.context['marker'] = this._tile.location;
        }
        console.log(options);
        this.modal.showModal(ModalComponent, options).then(res => {
            this._tile.location = res;
            this.errorTileLocation = false;
            console.log(this._tile.location);
        });
    }
    
    private showConditionOptions() {
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

    private ConditionChanged(args){
        if(args === "") {
            this.errorTileCondition = true;
        } else {
            this.errorTileCondition = false;
        }
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
            title: localize('tile.pictures.remove'),
            okButtonText: localize('yes'),
            cancelButtonText: localize('no'),
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
    
    private onSaveAndProceed(){
        const isValid = this.hasErrors();
        if(isValid){
            if(!this.onEdit){
                this.tiles.push(this._tile);
            } else {
                this.onEdit = !this.onEdit
            }
            this._tile = new Tile(this.ObjectId(),"","","","",[],this._session.id,[]);
            this.errorTileName = true;
            this.errorTileInfo = true;
            this.errorTileYear = true;
            this.errorTileCondition = true;
            this.errorTileImages = true;
            this.errorTileLocation = true;
            this.hasSession=!this.hasSession;
        } else {
            Toast.makeText(localize('tile.submit.error'),'short').show();
        }
    }

    private hasErrors(){
        if(!this.errorTileName && !this.errorTileInfo && !this.errorTileYear && !this.errorTileCondition && !this.errorTileImages && !this.errorTileLocation){
            return true
        } else {
            return false
        }
    }

    private onCancel(){
        this.hasSession=!this.hasSession;
    }

    private SessionNameChanged(args){
        if(args === "") {
            this.errorSessionName = true;
        } else {
            this.errorSessionName = false;
        }
    }

    private editTile(i){
        this.onEdit = true;
        this.errorTileImages = false;
        this.errorTileLocation = false;
        this.hasSession = false;
        this._tile = this.tiles[i];
    }

    private deleteTile(i){
        dialogs.confirm({
            title: localize('tile.list.delete') +this.tiles[i].name,
            message: localize('tile.list.message'),
            okButtonText: localize('yes'),
            cancelButtonText: localize('no'),
        }).then(result => {
            if(result) {
                this.tiles.splice(i,1);
                Toast.makeText(localize('tile.list.delete.confirmation'),'short').show();
            }
            console.log("Dialog result: " + result);
        });  
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

}

