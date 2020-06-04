// Angular Modules
import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { ModalDialogService } from "nativescript-angular/directives/dialogs";
// NativeScript Core Modules
import { ImageSource, fromFile } from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";
import { getString } from 'tns-core-modules/application-settings/application-settings';
import { ListViewEventData } from "nativescript-ui-listview";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { Button } from 'tns-core-modules/ui/button';
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";
// External Packages
import * as Toast from 'nativescript-toast';
import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";
import { localize } from "nativescript-localize";
// Azulejos Services
import { UrlService } from "../shared/url.service";
// Azulejos Components
import {TabsComponent} from "../tabs/tabs.component";
import { ModalComponent } from "./map-modal/map-modal";

@Component({
    selector: "Submeter",
    templateUrl: "./submeter.component.html",
    styleUrls: ["./submeter.component.css"]
})
export class SubmeterComponent implements OnInit {

    private ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) =>
        s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));

    private submittedTiles = [];
    private sessionID = this.ObjectId();
    private imageArray = [];
    private file: string;
    private processing = false;
    private darkenStack;

    private dialogButton: Button;
    private fotoButton: Button;
    private galeriaButton: Button;
    private nome: TextField;
    private sessao: TextField;
    private ano: TextField;
    private info: TextView;
    private fieldsToValidate;
    private location = [];
    
    @ViewChild('dialogButton', { static: true }) private conditionBtn: ElementRef;
    @ViewChild('btnGaleria', { static: true }) private galeria: ElementRef;
    @ViewChild('btnFoto', { static: true }) private foto: ElementRef;
    @ViewChild('nome', { static: true }) private name: ElementRef;
    @ViewChild('sessao', { static: true }) private session: ElementRef;
    @ViewChild('ano', { static: true }) private year: ElementRef;
    @ViewChild('info', { static: true }) private infoInpt: ElementRef;
    @ViewChild('darken', { static: true }) private dark: ElementRef;

    constructor(
        private modal: ModalDialogService, 
        private vcRef: ViewContainerRef, 
        private _url: UrlService, 
        private _tabComponent: TabsComponent) { }

    ngOnInit(): void {
        this.darkenStack = this.dark.nativeElement;
        this.dialogButton = <Button>this.conditionBtn.nativeElement;
        this.galeriaButton = <Button>this.galeria.nativeElement;
        this.fotoButton = <Button>this.foto.nativeElement;
        this.nome = <TextField>this.name.nativeElement;
        this.sessao = <TextField>this.session.nativeElement;
        this.ano = <TextField>this.year.nativeElement;
        this.info = <TextView>this.infoInpt.nativeElement;
        this.fieldsToValidate = [this.sessao, this.nome, this.info, this.ano, this.dialogButton];
    }

    private showModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(ModalComponent, options).then(res => {
            this.location = res;
        });
    }

    private displayActionDialog() {
        let options = {
            title: localize("tile.conditions.dialog.title"),
            message: localize("tile.conditions.dialog.message"),
            cancelButtonText: localize("tile.conditions.dialog.cancel"),
            actions: [localize('tile.conditions.new'), localize('tile.conditions.damaged'), localize('tile.conditions.maintenance'), localize('tile.conditions.restored')]
        };

        dialogs.action(options).then((result) => {
            if (result !== options.cancelButtonText)
                this.dialogButton.text = result;

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
                    that.imageArray.push(selection[i]._android)
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
                    this.imageArray.push(imageAsset.android);
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
                const index = this.imageArray.indexOf(selectedItems[0]);
                this.imageArray.splice(index,1);
            }
        });
    }

    private onSubmit() {
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
                            "idAutor": getString("id"),
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
                        this.goToMap()   
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
    }

    private saveTile() {
        var validated = this.validateInputs();
        if (!validated) {
            Toast.makeText(localize("tile.submit.error"),'long').show();
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

    private validateInputs() {
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

    private errorCss(element, set) {
        if (set) {
            element.borderWidth = "1";
            element.borderColor = "red";
        }
        else {
            element.borderWidth = "1";
            element.borderColor = "#d4d4d4";
        }
    }

    private goToMap(){
        this._tabComponent.onTabSelect("tab"+0)
    }
}
