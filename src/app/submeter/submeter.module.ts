import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";

//import { SubmeterRoutingModule } from "./submeter-routing.module";
import { SubmeterComponent } from "./submeter.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule,
        NativeScriptRouterModule.forChild([
            { path: "", redirectTo: "submeter" },
            { path: "submeter", component: SubmeterComponent }
        ])
    ],
    declarations: [
        SubmeterComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SubmeterModule { }
