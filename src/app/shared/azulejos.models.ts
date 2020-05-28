export class Tile {
    public id: string;
    public name: string;
    public info: string;
    public ano: string;
    public condicao: string;
    public localizacao;
    public sessao: string;
    public nrImages: string;
}
export class Session {
    public id: string;
    public data: string;
    public estado: string;
    public nome: string;
    public tiles;

}
export class TileMarker {
    public id: string;
    public name: string
    public coordinates;
    public distance;
}

/*
map.component
export class TileItem {
    constructor(public id: string, public name: string, public distance: string) { }
}
a rota nao precisa da informação toda pode devolver so a localização distanciae nome

tile.detail
export class SessionItem {
    constructor(
        public id: string,
        public name: string) { }
}
export class TileItem {
    constructor(
        public id: string,
        public name: string,
        public info: string,
        public ano: string,
        public condicao: string,
        public localizacao,
        public sessao: string,
        public nrImages: string) {}
}

perfil
export class SessionItem {
    constructor(
        public id: string,
        public data: string,
        public estado: string,
        public nome: string,
        public tiles) { }
}
submeter
nao usa nenhum mas podia

*/