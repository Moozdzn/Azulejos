import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { MapaComponent } from "./mapa.component";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptUIAutoCompleteTextViewModule } from "nativescript-ui-autocomplete/angular";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";

//import { ItemDetailComponent } from "./item-detail/item-detail.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptUIAutoCompleteTextViewModule,
        NativeScriptRouterModule,
        NativeScriptLocalizeModule,
        NativeScriptRouterModule.forChild([
            { path: "", redirectTo: "mapa"},
            { path: "mapa", component: MapaComponent}
        ])
    ],
    declarations: [
        MapaComponent,
        //ItemDetailComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class MapaModule { }
