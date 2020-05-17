import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef } from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";
import { ModalDialogService } from "nativescript-angular/directives/dialogs";

import * as dialogs from "tns-core-modules/ui/dialogs";
import * as http from "tns-core-modules/http";
import { action } from "tns-core-modules/ui/dialogs";
import { Button } from 'tns-core-modules/ui/button';
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";
import { Accuracy } from "tns-core-modules/ui/enums";
import { ImageSource, fromFile} from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";

import * as geolocation from "nativescript-geolocation";
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



    // Image Picker Preview - Not working
    //thumbSize : number = 80;
    //previewSize : number = 300;
    // Server URL
    url = "http://192.168.42.9:3000/api/sessoes/azulejos";
    // Action Dialog Button
    @ViewChild('dialogButton', { static: true }) db: ElementRef;
    @ViewChild('nome', { static: true }) n: ElementRef;
    @ViewChild('sessao', { static: true }) s: ElementRef;
    @ViewChild('ano', { static: true }) a: ElementRef;
    @ViewChild('info', { static: true }) i: ElementRef;

    dialogButton: Button;
    nome: TextField;
    sessao: TextField;
    ano: TextField;
    info: TextView;
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
        this.nome = <TextField>this.n.nativeElement;
        this.sessao = <TextField>this.s.nativeElement;
        this.ano = <TextField>this.a.nativeElement;
        this.info = <TextView>this.i.nativeElement;
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
        let options = {
            title: "Erro no formulário",
            message: "Não adicionou imagens do azulejo",
            okButtonText: "OK"
        };
        if (this.location.length == 0) {
            geolocation.enableLocationRequest().then(() => {
                geolocation.getCurrentLocation({ desiredAccuracy: Accuracy.high }).then((location) => {
                    this.location = [location.longitude, location.altitude]
                })
            })
        }
        var imagesToSubmit = [];
        if (this.imageArray.length > 0) {
            for (var i in this.imageArray) {
                this.file = fs.path.normalize(this.imageArray[i]);
                const ImageFromFilePath: ImageSource = <ImageSource>fromFile(this.file);
                var ImageData = ImageFromFilePath.toBase64String("jpg");
                imagesToSubmit.push(ImageData);
            }
        }
        else {

            options.message = "Não adicionou imagens do azulejo";

            dialogs.alert(options);
            return false;
        }

        var tile = {
            "_id": this.ObjectId(),
            "Nome": this.nome.text,
            "Ano": this.ano.text,
            "Info": this.info.text,
            "Condicao": this.dialogButton.text,
            "Localizacao": [this.location[1], this.location[0]],
            "Sessao": this.sessionID,
            "Files": imagesToSubmit
        }

        var keys = Object.keys(tile);

        for (i in keys) {

            if (tile[keys[i]].length == 0 || (keys[i] == "Condicao" && tile[keys[i]] == "Escolha condição")) {
                options.message = keys[i] + ' do azulejo não pode estar vazio';
                dialogs.alert(options);
                return false
            }
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
                    http.request({
                        url: this._url.getUrl() + "sessoes",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        content: JSON.stringify(body)
                    }).then((r: any) => {
                        
                        this.sessao.text = "";
                        this.sessao.editable = true;


                    }).catch(function (e) {
                        console.log("Uh oh, something went wrong1", e);
                        alert("The following error ocurred: " + e)
                    });
                }
                else {
                    return
                }
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
}
