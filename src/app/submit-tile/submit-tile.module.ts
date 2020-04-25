import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { SubmitTileRoutingModule } from "./submit-tile-routing.module";
import { SubmitTileComponent } from "./submit-tile.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        SubmitTileRoutingModule
    ],
    declarations: [
        SubmitTileComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SubmitTileModule { }
