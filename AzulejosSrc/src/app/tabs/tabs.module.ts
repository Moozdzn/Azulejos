import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptRouterModule, NSEmptyOutletComponent } from "nativescript-angular/router";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";


import { TabsComponent } from "./tabs.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptRouterModule,
        NativeScriptLocalizeModule,
        NativeScriptRouterModule.forChild([
            {
                path: "default", component: TabsComponent, children: [
                    {
                        path: "mapa",
                        outlet: "mapaTab",
                        component: NSEmptyOutletComponent,
                        loadChildren: () => import("~/app/mapa/mapa.module").then((m) => m.MapaModule),
                    },
                    {
                        path: "submeter",
                        outlet: "submeterTab",
                        component: NSEmptyOutletComponent,
                        loadChildren: () => import("~/app/submeter/submeter.module").then((m) => m.SubmeterModule),
                    },
                    {
                        path: "perfil",
                        outlet: "perfilTab",
                        component: NSEmptyOutletComponent,
                        loadChildren: () => import("~/app/perfil/perfil.module").then((m) => m.PerfilModule),
                    }
                ]
            }
        ])
    ],
    declarations: [
        TabsComponent
    ],
    providers: [
    ],
    schemas: [NO_ERRORS_SCHEMA]
})
export class TabsModule { }