import { Component, OnInit } from '@angular/core';
import {request} from "tns-core-modules/http";
import { Router, NavigationExtras, ActivatedRoute } from "@angular/router";


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

  constructor(private route: ActivatedRoute,private router: Router) { 
    this.route.queryParams.subscribe(params =>{
      this.id = params["id"];
    })
  }

  ngOnInit(): void {
    request({
      url:"http://192.168.1.11:3000/api/sessoes/"+this.id,
      method: "GET",
      headers: { "Content-Type": "application/json" }
        }).then((r)=>{
            var data = JSON.stringify(r.content)
            var json = JSON.parse(data)
            this.name = json.Nome;
            this.info = json.Info;
            this.ano = json.Ano;
            this.condicao = json.Condicao; 
            this.sessao = json.Sessao;    
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
