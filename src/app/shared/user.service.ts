/* // The following is a sample implementation of a backend service using Progress Kinvey (https://www.progress.com/kinvey).
// Feel free to swap in your own service / APIs / etc here for your own apps.

import { Injectable } from "@angular/core";

import { User } from "./user.model";
import * as http from "tns-core-modules/http";

@Injectable()
export class UserService {
    public serverURL : string = "http://192.168.0.104:3000/api/auth";
    constructor() { }

    login(user: User) {
        http.request({
            url: this.serverURL,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            content: JSON.stringify({
                username: user.email,
                password: user.password
            })
        }).then((r) => { return r }, (e) => {
            return e
        })
    }
} */
