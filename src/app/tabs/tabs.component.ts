import { Component, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";


@Component({
    moduleId: module.id,
    selector: "tabs-page",
    templateUrl: "./tabs.component.html",styleUrls:["./tabs.component.css"]
})
export class TabsComponent {
    @ViewChild('tab0', { static: false }) tab0: ElementRef;
	@ViewChild('tab1', { static: false }) tab1: ElementRef;
    @ViewChild('tab2', { static: false }) tab2: ElementRef;
    @ViewChild("tabView", {static: false}) tabView: ElementRef;

    constructor(
        private routerExtension: RouterExtensions,
        private activeRoute: ActivatedRoute) {
    }

    ngOnInit() {
        this.routerExtension.navigate([{ outlets: { mapaTab: ["mapa"], submeterTab: ["submeter"], perfilTab: ["perfil"] } }], { relativeTo: this.activeRoute });
    }

    onTabSelect(index){
        switch (index){
            case "tab0":
                this.tab0.nativeElement.class = "selected";
                this.tab1.nativeElement.class = "";
                this.tab2.nativeElement.class = "";
                break;
            case "tab1":
                this.tab1.nativeElement.class = "selected";
                this.tab0.nativeElement.class = "";
                this.tab2.nativeElement.class = "";
                break;
            case "tab2":
                this.tab2.nativeElement.class = "selected";
                this.tab0.nativeElement.class = "";
                this.tab1.nativeElement.class = "";
                break;
            default:
                break;
        }
    }
   
}