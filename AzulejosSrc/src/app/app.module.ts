import { NgModule, NO_ERRORS_SCHEMA, ErrorHandler, NgModuleFactoryLoader } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";

import { AppRoutingModule, COMPONENTS } from "./app-routing.module";
import { AppComponent } from "./app.component";

import {TileDetailComponent} from "./mapa/tile-detail/tile-detail"
import {ModalComponent} from "./submeter/map-modal/map-modal";
import {ModalDialogService} from "nativescript-angular/modal-dialog";

import { enable as traceEnable, addCategories } from "tns-core-modules/trace";

import { UrlService } from "./shared/url.service"

import { NSModuleFactoryLoader } from "nativescript-angular/router";

import { NativeScriptFormsModule } from "nativescript-angular/forms";

traceEnable();

export class MyErrorHandler implements ErrorHandler {
    handleError(error) {
        console.log("### ErrorHandler Error: " + error.toString());
        console.log("### ErrorHandler Stack: " + error.stack);
    }
}


@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptFormsModule,
        NativeScriptLocalizeModule
    ],
    entryComponents:[
        ModalComponent,
        TileDetailComponent
    ],
    declarations: [
        AppComponent,
        ModalComponent,
        TileDetailComponent,
        ...COMPONENTS
    ],
    providers: [
        ModalDialogService,
        UrlService,
        { provide: ErrorHandler, useClass: MyErrorHandler },
        { provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader }
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
