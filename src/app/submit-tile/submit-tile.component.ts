import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';

import { action } from "tns-core-modules/ui/dialogs";
import { Page } from 'tns-core-modules/ui/page';
import { Button } from 'tns-core-modules/ui/button';
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";
// USED TO SEND THE NEW SUBMISSION
import * as http from "tns-core-modules/http";
// USED TO GET SUBMISSION LOCATION
import * as geolocation from "nativescript-geolocation";
import { Accuracy } from "tns-core-modules/ui/enums";
// FOR CAMERA AND GALLERY USE/ACESS
import * as camera from "nativescript-camera";
import {ImageSource, fromFile, fromResource, fromBase64} from "tns-core-modules/image-source";
import * as fs from "tns-core-modules/file-system";
import * as imagepicker from "nativescript-imagepicker";

// OPEN MAP
import { Mapbox, MapStyle ,MapboxMarker, MapboxViewApi, MapboxView} from "nativescript-mapbox-enduco";



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
    // TAKE PHOTO
    takePhoto(){
        if(camera.isAvailable()){
        camera.requestCameraPermissions().then(()=>{
            camera.takePicture()
            .then((imageAsset) => {
                console.log("Result is an image asset instance");
                
                this.imageSrc = imageAsset;
            }).catch((err) => {
                console.log("Error -> " + err.message);
                    });},() => alert('permissions rejected'))
        }
    }
    // ALTERAR A LOCALIZAÇÃO DEFINIDA
    alterLocation(){
        let that = this;
        geolocation.enableLocationRequest().then(()=>{
            geolocation.getCurrentLocation({desiredAccuracy:Accuracy.high}).then((location)=>{
                that.locatioMarker = <MapboxMarker>{
                    id: 1, // can be user in 'removeMarkers()'
                    lat: location.latitude, // mandatory
                    lng: location.longitude, // mandatory
                    title: 'Localizacao azulejo', // recommended to pass in
                    subtitle: 'Pressione outro local para mudar a localização', // one line is available on iOS, multiple on Android
                    selected: true, // makes the callout show immediately when the marker is added (note: only 1 marker can be selected at a time)
                    onTap: function(marker) { console.log("This marker was tapped"); },
                    onCalloutTap: function(marker) { console.log("The callout of this marker was tapped"); }
                  };
                  
                  that.mapbox.show({
                    accessToken: 'pk.eyJ1IjoibW9vemR6biIsImEiOiJjazd5eGh6bjAwMGl1M21vOTdjMTI1d3NzIn0.cxQh0B_dBFEc7xNjtn0-zQ', // see 'Prerequisites' above
                    style: MapStyle.TRAFFIC_DAY, // see the mapbox.MapStyle enum for other options, default mapbox.MapStyle.STREETS
                    margins: {
                      left: 18, // default 0
                      right: 18, // default 0
                      top: 300, // default 0
                      bottom: 50 // default 0, this shows how to override the style for iOS
                    },
                    center: { // optional without a default
                      lat: location.latitude,
                      lng: location.longitude
                    },
                    zoomLevel: 15, // 0-20, default 0
                    showUserLocation: true, // default false - requires location permissions on Android which you can remove from AndroidManifest.xml if you don't need them
                    hideAttribution: false, // default true, Mapbox requires `false` if you're on a free plan
                    hideLogo: false, // default false, Mapbox requires this default if you're on a free plan
                    hideCompass: false, // default false
                    disableRotation: false, // default false
                    disableScroll: false, // default false
                    disableZoom: false, // default false
                    markers: [ // optional without a default
                        that.locatioMarker
                    ]
                  }).then(
                      function(showResult) {
                        console.log("Mapbox show done for " + (showResult.ios ? "iOS" : "Android") + ", native object received: " + (showResult.ios ? showResult.ios : showResult.android));
                        that.mapbox.setOnMapClickListener((point) => {
                            console.log("Map clicked at latitude: " + point.lat + ", longitude: " + point.lng);
                            alert('hello');
                        });
                      },
                      function(error) {
                        console.log("mapbox show error: " + error);
                      }
                  )
            })
        })
        
    }
}

