import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";

//import { PerfilRoutingModule } from "./perfil-routing.module";
import { PerfilComponent } from "./perfil.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule,
        NativeScriptLocalizeModule,
        NativeScriptRouterModule.forChild([
            { path: "", redirectTo: "perfil" },
            { path: "perfil", component: PerfilComponent }
        ])
    ],
    declarations: [
        PerfilComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class PerfilModule { }
