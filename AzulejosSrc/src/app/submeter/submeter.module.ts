import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";
import { NativeScriptUIDataFormModule } from "nativescript-ui-dataform/angular";
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { SubmeterComponent } from "./submeter.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule,
        NativeScriptLocalizeModule,
        NativeScriptFormsModule,
        NativeScriptUIListViewModule,
        NativeScriptUIDataFormModule,
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
