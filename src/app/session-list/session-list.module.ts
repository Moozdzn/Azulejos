import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { SessionListRoutingModule } from "./session-list-routing.module";
import { SessionListComponent } from "./session-list.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        SessionListRoutingModule
    ],
    declarations: [
        SessionListComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SessionListModule { }
