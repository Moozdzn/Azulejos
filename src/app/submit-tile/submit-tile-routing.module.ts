import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SubmitTileComponent } from "./submit-tile.component";

const routes: Routes = [
    { path: "", component: SubmitTileComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class SubmitTileRoutingModule { }