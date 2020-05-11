import {Component,OnInit,ViewChild,ElementRef,ViewContainerRef} from '@angular/core';
import {action} from "tns-core-modules/ui/dialogs";
import {Page} from 'tns-core-modules/ui/page';
import {Button} from 'tns-core-modules/ui/button';
import {TextField} from "tns-core-modules/ui/text-field";
import {TextView} from "tns-core-modules/ui/text-view";
// USED TO SEND THE NEW SUBMISSION
import * as http from "tns-core-modules/http";
// USED TO GET SUBMISSION LOCATION
import * as geolocation from "nativescript-geolocation";
import {Accuracy} from "tns-core-modules/ui/enums";
// FOR CAMERA AND GALLERY USE/ACESS
import * as camera from "nativescript-camera";
import {ImageSource, fromFile, fromResource, fromBase64} from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";
import * as imagepicker from "nativescript-imagepicker";
// MODAL
import {ModalDialogService} from "nativescript-angular/directives/dialogs";
import {ModalComponent} from "./map-modal/map-modal";

import {UrlService} from "../shared/url.service"

import * as dialogs from "tns-core-modules/ui/dialogs";

@Component({
    selector: "Submeter",
    templateUrl: "./submeter.component.html",
    styleUrls: ["./submeter.component.css"]
})
export class SubmeterComponent implements OnInit {

    imageArray = [];
    
    imageAssets = [];
    imageSrc : any;
    isSingleMode : boolean = true;
    private file : string;
    // Image Picker Preview - Not working
    thumbSize : number = 80;
    previewSize : number = 300;
    // Server URL
    url = "http://192.168.42.9:3000/api/sessoes/azulejos";
    // Action Dialog Button
    @ViewChild('dialogButton', {static: true})dp : ElementRef;
    @ViewChild('nome', {static: true})dp1 : ElementRef;
    @ViewChild('ano', {static: true})dp2 : ElementRef;
    @ViewChild('info', {static: true})dp3 : ElementRef;

    dialogButton : Button;
    nome : TextField;
    ano : TextField;
    info : TextView;
    location : any;
    
    constructor(private page : Page, private modal : ModalDialogService, private vcRef : ViewContainerRef, private _url: UrlService) {
        // Use the component constructor to inject providers.
    }

    public showModal() {
        let options = {
            context: {},
            fullscreen: true,
            viewContainerRef: this.vcRef
        };
        this.modal.showModal(ModalComponent, options).then(res => {
            console.log(res);
            this.location = res;
        });
    }

    ngOnInit(): void {
        // Use the "ngOnInit" handler to initialize data for the view.
        this.dialogButton = <Button> this.dp.nativeElement;
        this.nome = <TextField> this.dp1.nativeElement;
        this.ano = <TextField> this.dp2.nativeElement;
        this.info = <TextView> this.dp3.nativeElement;
    }

    //
    public onSelectSingleTap() {
        this.isSingleMode = false;

        let context = imagepicker.create({mode: "multiple"});
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
            if(selection.length > 0){
                for(var i in selection){
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
            console.log(result);
        });
    }
    // Submit Tile
    onSubmit() {
        dialogs.prompt({
            title: "Quer submeter mais azulejos?",
            message: "Dê um nome à sua sessão.",
            okButtonText: "Confirmar",
            cancelButtonText: "Não",
            defaultText: "Exemplo: Grupo de Azulejos do prédio X.",
            inputType: dialogs.inputType.text
        }).then(r => {
            var imagesToSubmit = [];
            if(this.imageArray.length > 0){
                for(var i in this.imageArray){
                this.file = fs.path.normalize(this.imageArray[i]);
                const ImageFromFilePath: ImageSource = <ImageSource> fromFile(this.file);
                var ImageData = ImageFromFilePath.toBase64String("jpg");
                imagesToSubmit.push(ImageData);
                }
            }
        
            var body = {
                file: imagesToSubmit,
                nome: this.nome.text,
                ano: this.ano.text,
                info: this.info.text,
                condicao: this.dialogButton.text,
                coordinates: [
                    this.location[1], this.location[0]
                 ]
            }
            if(r.result){
                http.request({
                    url: this._url.getUrl()+"sessoes",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    content: JSON.stringify({
                       info: r.text,
                       userID: this._url.getID(),
                    })
                }).then((r: any) => {
                    
                    body["sessionID"] = r.content;
                    alert(JSON.stringify(body));
                    this.sendTile(body);

                    this.dialogButton.text = "Escolha condição";
                    this.nome.text = "";
                    this.info.text = "";
                    this.ano.text = "";
                    this.imageArray = [];
        
                }).catch(function (e) {
                    console.log("Uh oh, something went wrong1", e);
                    alert("The following error ocurred: " + e)
                });

            }
            else if (r.result == false){
                body["sessionID"] = false;
                this.sendTile(body)
            }
            else {
                 alert('An error occurred')
            }
            });
    }
    sendTile(content){
        http.request({
            url: this._url.getUrl()+"sessoes/azulejos",
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            content: JSON.stringify(content)
        }).then(function (r: any) {
            alert("submitted succefully");

        }).catch(function (e) {
            console.log("Uh oh, something went wrong2", e);
            alert("The following error ocurred: " + e)
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
