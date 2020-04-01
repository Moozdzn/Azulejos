import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptUIAutoCompleteTextViewModule } from "nativescript-ui-autocomplete/angular";

import { MapRoutingModule } from "./map-routing.module";
import { MapComponent } from "./map.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        MapRoutingModule,
        NativeScriptUIAutoCompleteTextViewModule

    ],
    declarations: [
        MapComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class MapModule { }
