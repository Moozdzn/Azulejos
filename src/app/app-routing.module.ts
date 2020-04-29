import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

const routes: Routes = [
    { path: "", redirectTo: "/map", pathMatch: "full" },
    { path: "map", loadChildren: () => import("~/app/map/map.module").then((m) => m.MapModule) },
    { path: "browse", loadChildren: () => import("~/app/browse/browse.module").then((m) => m.BrowseModule) },
    { path: "search", loadChildren: () => import("~/app/search/search.module").then((m) => m.SearchModule) },
    { path: "featured", loadChildren: () => import("~/app/featured/featured.module").then((m) => m.FeaturedModule) },
    { path: "settings", loadChildren: () => import("~/app/settings/settings.module").then((m) => m.SettingsModule) },
    { path: "details", loadChildren: () => import("~/app/details/details.module").then((m) => m.DetailsModule) },
    { path: "session-list", loadChildren: () => import("~/app/session-list/session-list.module").then((m) => m.SessionListModule)},
    { path: "submit-tile", loadChildren: () => import("~/app/submit-tile/submit-tile.module").then((m) => m.SubmitTileModule) }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
