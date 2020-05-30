import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { ModalDialogService } from "nativescript-angular/directives/dialogs";

import * as dialogs from "tns-core-modules/ui/dialogs";

import { RadDataFormComponent } from "nativescript-ui-dataform/angular";

import { action } from "tns-core-modules/ui/dialogs";
import { Button } from 'tns-core-modules/ui/button';
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";
//import { StackLayout } from "tns-core-modules/"

import { ImageSource, fromFile } from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";

import * as Toast from 'nativescript-toast';
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";

import { ModalComponent } from "./map-modal/map-modal";

import { UrlService } from "../shared/url.service";

import { localize } from "nativescript-localize";

import { ListViewEventData, RadListView } from "nativescript-ui-listview";


export class Session{
    constructor(public id:string,public name:string,public info:string,public azulejo){
        this.id = id;
        this.name = name;
        this.info = info;
        this.azulejo = [];
    }
}

@Component({
    selector: "Submeter",
    templateUrl: "./submeter.component.html",
    styleUrls: ["./submeter.component.css"]
})
export class SubmeterComponent implements OnInit {

    ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
        s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    submittedTiles = [];
    sessionID = this.ObjectId();
    imageArray = [];

    imageAssets = [];
    imageSrc: any;
    isSingleMode: boolean = true;
    private file: string;
    public wError = true;
    processing = false;
    sessionExists = false;
    currentSession;
    private _session:Session;

    // Action Dialog Button
    @ViewChild('sessionForm', { static: false }) sessionForm: RadDataFormComponent;
    @ViewChild('dialogButton', { static: true }) db: ElementRef;
    @ViewChild('btnGaleria', { static: true }) galeria: ElementRef;
    @ViewChild('btnFoto', { static: true }) foto: ElementRef;
    @ViewChild('nome', { static: true }) n: ElementRef;
    @ViewChild('sessao', { static: true }) s: ElementRef;
    @ViewChild('sessaoInfo', { static: true }) si: ElementRef;
    @ViewChild('ano', { static: true }) a: ElementRef;
    @ViewChild('info', { static: true }) i: ElementRef;
    @ViewChild('darken', { static: true }) dark: ElementRef;

    dialogButton: Button;
    fotoButton: Button;
    galeriaButton: Button;
    nome: TextField;
    sessao: TextField;
    sessaoInfo: TextView;
    ano: TextField;
    info: TextView;
    darkenStack;
    fieldsToValidate = [];
    location = [];
    array = [];

    constructor(private modal: ModalDialogService, private vcRef: ViewContainerRef, private _url: UrlService) {
        // Use the component constructor to inject providers.
    }

    public showModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(ModalComponent, options).then(res => {
            this.location = res;
        });
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        this._session = new Session(this.ObjectId(),null,null,null);
        
        this.darkenStack = this.dark.nativeElement;
        this.dialogButton = <Button>this.db.nativeElement;
        this.galeriaButton = <Button>this.galeria.nativeElement;
        this.fotoButton = <Button>this.foto.nativeElement;
        this.nome = <TextField>this.n.nativeElement;
        this.sessao = <TextField>this.s.nativeElement;
        this.sessaoInfo = <TextView>this.si.nativeElement;
        this.ano = <TextField>this.a.nativeElement;
        this.info = <TextView>this.i.nativeElement;
        this.fieldsToValidate = [this.sessao,this.sessaoInfo, this.nome, this.info, this.ano, this.dialogButton];
    }
    get session(): Session {
        return this._session;
    }

    //
    public onSelectSingleTap() {
        this.isSingleMode = false;

        let context = imagepicker.create({ mode: "multiple" });
        this.startSelection(context);
    }

    private startSelection(context) {
        let that = this;

        context.authorize().then(() => {
            //that.imageAssets = [];
            //that.imageSrc = null;
            return context.present();
        }).then((selection) => {
            //console.log("Selection done: " + JSON.stringify(selection));
            if (selection.length > 0) {
                for (var i in selection) {
                    that.imageArray.push(selection[i]._android)
                    that.array.push(selection[i]._android);
                }
                //console.log(that.imageArray)
            }
        }).catch(function (e) {
            console.log(e);
        });
    }

    // DIALOG ACTION
    displayActionDialog() {
        let options = {
            title: localize("tile.conditions.dialog.title"),
            message: localize("tile.conditions.dialog.message"),
            cancelButtonText: localize("tile.conditions.dialog.cancel"),
            actions: [localize('tile.conditions.new'), localize('tile.conditions.damaged'), localize('tile.conditions.maintenance'), localize('tile.conditions.restored')]
        };

        action(options).then((result) => {
            if (result !== options.cancelButtonText)
                this.dialogButton.text = result;

        });
    }
    public onItemSelected(args: ListViewEventData) {
        let options = {
            title: "Pretende remover a imagem selecionada?",
            okButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        }

        dialogs.confirm(options).then(result => {
            if(result){
                const listview = args.object;
                const selectedItems = listview.getSelectedItems();
                const index = this.array.indexOf(selectedItems[0]);
       
                this.array.splice(index,1);
            }
        });
    }

    saveTile() {
        var validated = this.validateInputs();
        if (!validated) {
            alert(localize("tile.submit.error"));
            return false;
        } else {
            if (this.location.length == 0) {
                var updatedLocation = this._url.getUserLocation();
                this.location = [updatedLocation.lng,updatedLocation.lat]
            }
            var b64Images = this.imagesToBase64();
            var tile = {
                "_id": this.ObjectId(),
                "Nome": this.nome.text,
                "Ano": this.ano.text,
                "Info": this.info.text,
                "Condicao": this.dialogButton.text,
                "Localizacao": this.location,
                "Sessao": this.sessionID,
                "Files": b64Images
            }
            this.submittedTiles.push(tile);
            this.dialogButton.text = localize("tile.condition.hint");
            this.nome.text = "";
            this.info.text = "";
            this.ano.text = "";
            this.imageArray = [];
            this.location = [];
            return true;
        }
    }
    createSession(){
        if(!this.sessionExists){
            var sessionValid = true;
            const form = this.sessionForm.dataForm;
            const name = form.getPropertyByName("name")
            const info = form.getPropertyByName("info")
            const group = form.getGroupByName("Session");

            if(name.value != null && name.isValid){} else sessionValid = false;
            if(info.value != null && info.isValid){} else sessionValid = false;
            if(sessionValid){
                name.readOnly = true;
                info.readOnly = true;
                group.collapsed = true;
                form.commitAll();
                this.sessionExists = true;
                return true;
            } else return false
        } else return true
    }
    // Submit Tile
    onSubmit() {
        var hasSession = this.createSession();
        if(hasSession){
            dialogs.confirm({
                title: localize("tile.submit.confirm.title"),
                message: localize("tile.submit.confirm.message"),
                okButtonText: localize("yes"),
                cancelButtonText: localize("review"),
                neutralButtonText: localize("tile.submit.another")
            }).then(result => {

            })
        }
    

    }
    /* onSubmit() {
        dialogs.confirm({
            title: localize("tile.submit.confirm.title"),
            message: localize("tile.submit.confirm.message"),
            okButtonText: localize("yes"),
            cancelButtonText: localize("review"),
            neutralButtonText: localize("tile.submit.another")
        }).then(result => {
            if (result) {
                var flag = this.saveTile();
                if (flag) {
                    this.darkenStack.class="darken";
                    this.processing = true;
                    var tilesID = [];
                    for (var i in this.submittedTiles) {
                        tilesID.push({ "_id": this.submittedTiles[i]._id, "Nome": this.submittedTiles[i].Nome })
                    }
                    //CONVERTER O ESTADO PARA PORTUGUES
                    var body = {
                        sessao: {
                            "_id": this.sessionID,
                            "estado": "SUBMETIDA",
                            "info": this.sessao.text,
                            "idAutor": this._url.getID(),
                            "azulejos": tilesID
                        },
                        azulejos: this.submittedTiles
                    }
                    this._url.submitTiles(body).then((r: any) => {
                        this.sessao.text = "";
                        this.sessao.editable = true;
                        this.sessionID = this.ObjectId();
                        this.darkenStack.class="";
                        this.processing = false;
                        Toast.makeText(localize("tile.submit.success"),'short').show();   
                    })
                        .catch(function (e) {
                            console.log("Uh oh, something went wrong1", e);
                            alert("The following error ocurred: " + e)
                        });
                }
                else {return}
            }
            else if (result === false) { }
            else {
                var flag = this.saveTile();
                if (flag) {
                    this.sessao.editable = false;
                }
                else {
                    return
                }
            }
        });
    } */
    // TAKE PHOTO
    takePhoto() {
        if (camera.isAvailable()) {
            camera.requestCameraPermissions().then(() => {
                camera.takePicture().then((imageAsset) => {
                    console.log("Result is an image asset instance");
                    this.imageArray.push(imageAsset.android);
                    this.array.push(imageAsset.android);
                }).catch((err) => {
                    console.log("Error -> " + err.message);
                });
            }, () => alert('permissions rejected'))
        }
    }

    validateInputs() {
        var valid = true;
        for (var i in this.fieldsToValidate) {
            if (this.fieldsToValidate[i].text.length == 0 || this.fieldsToValidate[i].text == localize("tile.condition.hint")) {
                this.errorCss(this.fieldsToValidate[i], true)
                valid = false;
            } else {
                this.errorCss(this.fieldsToValidate[i], false)
            }
        }
        if (this.imageArray.length == 0) {
            this.errorCss(this.galeriaButton, true)
            this.errorCss(this.fotoButton, true)
            valid = false;
        } else {
            this.errorCss(this.galeriaButton, false)
            this.errorCss(this.fotoButton, false)
        }
        return valid;
    }

    errorCss(element, set) {
        if (set) {
            element.borderWidth = "1";
            element.borderColor = "red";
        }
        else {
            element.borderWidth = "1";
            element.borderColor = "#d4d4d4";
        }
    }

    imagesToBase64() {
        var imagesToSubmit = [];

        for (var i in this.imageArray) {
            this.file = fs.path.normalize(this.imageArray[i]);
            const ImageFromFilePath: ImageSource = <ImageSource>fromFile(this.file);
            var ImageData = ImageFromFilePath.toBase64String("jpg");
            imagesToSubmit.push(ImageData);
        }
        return imagesToSubmit;
    }
}
