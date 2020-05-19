import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";

import * as dialogs from "tns-core-modules/ui/dialogs";

import { action } from "tns-core-modules/ui/dialogs";
import { Button } from 'tns-core-modules/ui/button';
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";

import { ImageSource, fromFile } from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";

import * as camera from "nativescript-camera";
import * as imagepicker from "nativescript-imagepicker";

import { ModalComponent } from "./map-modal/map-modal";

import { UrlService } from "../shared/url.service"



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


    // Image Picker Preview - Not working
    //thumbSize : number = 80;
    //previewSize : number = 300;
    // Server URL
    url = "http://192.168.42.9:3000/api/sessoes/azulejos";
    // Action Dialog Button
    @ViewChild('dialogButton', { static: true }) db: ElementRef;
    @ViewChild('btnGaleria', { static: true }) galeria: ElementRef;
    @ViewChild('btnFoto', { static: true }) foto: ElementRef;
    @ViewChild('nome', { static: true }) n: ElementRef;
    @ViewChild('sessao', { static: true }) s: ElementRef;
    @ViewChild('ano', { static: true }) a: ElementRef;
    @ViewChild('info', { static: true }) i: ElementRef;

    dialogButton: Button;
    fotoButton: Button;
    galeriaButton: Button;
    nome: TextField;
    sessao: TextField;
    ano: TextField;
    info: TextView;
    fieldsToValidate = [];
    location = [];

    constructor(private modal: ModalDialogService, private vcRef: ViewContainerRef, private _url: UrlService, private routerExtension: RouterExtensions) {
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
        this.dialogButton = <Button>this.db.nativeElement;
        this.galeriaButton = <Button>this.galeria.nativeElement;
        this.fotoButton = <Button>this.foto.nativeElement;
        this.nome = <TextField>this.n.nativeElement;
        this.sessao = <TextField>this.s.nativeElement;
        this.ano = <TextField>this.a.nativeElement;
        this.info = <TextView>this.i.nativeElement;
        this.fieldsToValidate = [this.sessao, this.nome, this.info, this.ano, this.dialogButton];

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
            console.log("Selection done: " + JSON.stringify(selection));
            if (selection.length > 0) {
                for (var i in selection) {
                    that.imageArray.push(selection[i]._android)
                }
                console.log(that.imageArray)
            }
            /*that.imageSrc = that.isSingleMode && selection.length > 0 ? selection[0] : null;

             //set the images to be loaded from the assets with optimal sizes (optimize memory usage)
             selection.forEach(function (element) {
                element.options.width = that.isSingleMode ? that.previewSize : that.thumbSize;
                element.options.height = that.isSingleMode ? that.previewSize : that.thumbSize;
            }); 
            that.imageAssets = selection;*/
        }).catch(function (e) {
            console.log(e);
        });
    }

    // DIALOG ACTION
    displayActionDialog() {
        let options = {
            title: "Condição",
            message: "Escolha condição do azulejo",
            cancelButtonText: "Cancelar",
            actions: ["NOVO", "DANIFICADO", "EM MANUTENCAO", "RESTAURADO"]
        };

        action(options).then((result) => {
            if (result !== options.cancelButtonText)
                this.dialogButton.text = result;

        });
    }

    saveTile() {
        var validated = this.validateInputs();
        if (!validated) {
            alert('Por favor preencha todos os campos antes de submeter');
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
            this.dialogButton.text = "Escolha condição";
            this.nome.text = "";
            this.info.text = "";
            this.ano.text = "";
            this.imageArray = [];
            this.location = [];
            return true;
        }
    }
    // Submit Tile
    onSubmit() {
        dialogs.confirm({
            title: "Submeter azujelo(s)?",
            message: "Não vai puder alterar as informações que inseriu!",
            okButtonText: "Sim",
            cancelButtonText: "Rever",
            neutralButtonText: "Submeter outro azulejo"
        }).then(result => {
            if (result) {
                var flag = this.saveTile();
                if (flag) {
                    var tilesID = [];
                    for (var i in this.submittedTiles) {
                        tilesID.push({ "_id": this.submittedTiles[i]._id, "Nome": this.submittedTiles[i].Nome })
                    }
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
    // TAKE PHOTO
    takePhoto() {
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

    validateInputs() {
        var valid = true;
        for (var i in this.fieldsToValidate) {
            if (this.fieldsToValidate[i].text.length == 0 || this.fieldsToValidate[i].text == "Escolha condição") {
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
            element.borderWidth = "2";
            element.borderColor = "red";
        }
        else {
            element.borderWidth = "0";
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
