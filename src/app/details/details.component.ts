import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {request} from "tns-core-modules/http";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";

import { Image } from "tns-core-modules/ui/image";


@Component({
  selector: 'ns-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  public id : string;
  public name: string;
  public info: string;
  public ano: string;
  public condicao: string;
  public sessao: string;

  @ViewChild('tileImage', { static: true }) dp: ElementRef;
  tileImage: Image;
  //TO BE REMOVED
  public serverURL:string = "http://192.168.0.106:3000/api/sessoes/";

  constructor(private route: ActivatedRoute,private router: Router) { 
    this.route.queryParams.subscribe(params =>{
      this.id = params["id"];
    })
  }

  ngOnInit(): void {
    this.tileImage = <Image>this.dp.nativeElement;
    request({
      url: this.serverURL + this.id,
      method: "GET",
      headers: { "Content-Type": "application/json" }
        }).then((r: any)=>{
            var data = JSON.stringify(r.content)
            var json = JSON.parse(data)
            this.name = json.Nome;
            this.info = json.Info;
            this.ano = json.Ano;
            this.condicao = json.Condicao; 
            this.sessao = json.Sessao;
            this.tileImage.src = "https://azulejos.b-cdn.net/"+this.id+"/1.jpg";
        },(e)=>{
            console.error(JSON.stringify(e))
            alert(e)
        })
  }
  openSessionList():void{
    let navigationExtras: NavigationExtras = {
        queryParams:{
            "id": this.sessao
        }
    }
    this.router.navigate(["/session-list"], navigationExtras)
}
}
