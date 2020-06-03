export class Tile {
    constructor(
        public id: string,
        public name: string,
        public info: string,
        public year: string,
        public condition: string,
        public location,
        public session: string,
        public nrImages: string) { } 
}

export class Session {
    constructor(
        public id: string,
        public name: string,
        public date: string,
        public state: string,
        public tiles) { }
}

export class TileMarker {
    constructor(
        public id: string, 
        public name: string, 
        public coordinates: Array<2>, 
        public distance) { }
}
