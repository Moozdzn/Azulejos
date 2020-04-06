import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import * as http from "tns-core-modules/http";
import { Observable as RxObservable } from 'rxjs';
import { ItemEventData } from "tns-core-modules/ui/list-view";
//import { MapComponent as map} from "~/app/map/map.component";




export class SessionItem{
  constructor(public id: string, public name:string) { }
}

@Component({
  selector: 'ns-session-list',
  templateUrl: './session-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionListComponent implements OnInit {
  
  public id: string;
  public myItems: RxObservable<Array<SessionItem>>;
  public items = [];

  constructor(private route: ActivatedRoute,private router: Router) {
    this.route.queryParams.subscribe(params =>{
      this.id = params["id"];
    })

    

    var subscr;
    this.myItems = RxObservable.create(subscriber => {
        subscr = subscriber;
        subscriber.next(this.items);
        return function () {
            console.log("Unsubscribe called!!!");
        }
    });
    http.getJSON("http://192.168.1.11:3000/api/"+this.id+"/azulejos/nome").then((r:any)=>{
      for(var i in r.docs){
        this.items.push(new SessionItem(r.docs[i]._id,r.docs[i].Nome));
      }
      subscr.next(this.items);
    })
  }

  ngOnInit(): void { }
   
  onItemTap(args):void{
    let navigationExtras: NavigationExtras = {
      queryParams:{
          "id": this.items[args.index].id
      }
    }
    this.router.navigate(["/details"], navigationExtras) 
  }
  

}
