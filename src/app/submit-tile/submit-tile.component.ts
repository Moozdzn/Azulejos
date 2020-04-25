import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import * as imagepicker from "nativescript-imagepicker";
import * as http from "tns-core-modules/http";
import * as fs from "tns-core-modules/file-system";
import { action } from "tns-core-modules/ui/dialogs";
import {ImageSource, fromFile, fromResource, fromBase64} from "tns-core-modules/image-source";
import { Page } from 'tns-core-modules/ui/page';
import { Button } from 'tns-core-modules/ui/button';
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";



@Component({
  selector: 'ns-submit-tile',
  templateUrl: './submit-tile.component.html'
})
export class SubmitTileComponent implements OnInit {
    // ImagePicker
    imageAssets = [];
    imageSrc: any;
    isSingleMode: boolean = true;
    private file: string;
    // Image Picker Preview - Not working
    thumbSize: number = 80;
    previewSize: number = 300;
    // Server URL
    url = "http://192.168.0.108:3000/api/sessoes/azulejos";
    // Action Dialog Button
    @ViewChild('dialogButton', { static: true }) dp: ElementRef;
    @ViewChild('nome', { static: true }) dp1: ElementRef;
    @ViewChild('ano', { static: true }) dp2: ElementRef;
    @ViewChild('info', { static: true }) dp3: ElementRef;
    dialogButton: Button;
    nome: TextField;
    ano: TextField;
    info: TextView;

    // New Submission contents

  constructor(private page: Page) { }

  ngOnInit(): void {
    this.dialogButton = <Button>this.dp.nativeElement;
    this.nome = <TextField>this.dp1.nativeElement;
    this.ano = <TextField>this.dp2.nativeElement;
    this.info = <TextView>this.dp3.nativeElement;

   }

  public onSelectSingleTap() {
    this.isSingleMode = true;

    let context = imagepicker.create({
        mode: "single"
    });
    this.startSelection(context);
}

  private startSelection(context) {
      let that = this;

      context
      .authorize()
      .then(() => {
          that.imageAssets = [];
          that.imageSrc = null;
          return context.present();
      })
      .then((selection) => {
          console.log("Selection done: " + JSON.stringify(selection));
          that.imageSrc = that.isSingleMode && selection.length > 0 ? selection[0] : null;
          
          // set the images to be loaded from the assets with optimal sizes (optimize memory usage)
          selection.forEach(function (element) {
              element.options.width = that.isSingleMode ? that.previewSize : that.thumbSize;
              element.options.height = that.isSingleMode ? that.previewSize : that.thumbSize;
          });

          that.imageAssets = selection;
      }).catch(function (e) {
          console.log(e);
      });
  }
///////////////////////////////////////////////

    //DIALOG ACTION
    displayActionDialog() {
        let options = {
            title: "Condição",
            message: "Escolha condição do azulejo",
            cancelButtonText: "Cancelar",
            actions: ["NOVO", "DANIFICADO", "EM MANUTENCAO", "RESTAURADO"]
        };

        action(options).then((result) => {
            this.dialogButton.text = result;
            console.log(result);
        });
    }
    //
    onSubmit() {

        this.file =  fs.path.normalize(this.imageSrc._android);
        const ImageFromFilePath: ImageSource = <ImageSource> fromFile(this.file);
        var ImageData = ImageFromFilePath.toBase64String("jpeg");

        geolocation.enableLocationRequest().then(()=>{
            geolocation.getCurrentLocation({desiredAccuracy:Accuracy.high}).then((location)=>{
                http.request({
                    url: this.url,
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    content: JSON.stringify({
                        file: ImageData,
                        nome : this.nome.text,
                        ano : this.ano.text,
                        info : this.info.text,
                        condicao : this.dialogButton.text,
                        coordinates:[
                            location.longitude,
                            location.latitude
                        ]
                    })
                }).then(function(r:any) {
                    alert("submitted succefully");
                }).catch(function(e) { 
                    console.log("Uh oh, something went wrong", e);
                    alert("The following error ocurred: "+e)
                });
            })
        })

        
    }
}