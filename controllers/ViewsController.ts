/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2022 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 **************************************************************************/

import { Express } from "express";
import * as path from "path";
import { IController } from "./IController.js";

export class ViewsController implements IController {
  static _instance: ViewsController;

  private _viewsDirectory = "";

  private constructor() {}

  static get instance() {
    if (!this._instance) {
      this._instance = new ViewsController();
    }

    return this._instance;
  }

  set viewsDirectory(value: string) {
    this._viewsDirectory = value;
  }

  register(app: Express) {
    app.get("/", (_, response) => {
      try {
        const homePage = path.join(this._viewsDirectory, "index.html");
        response.sendFile(homePage);
      } catch (error) {
        console.error(
          "Something went wrong while processing the request.",
          error
        );
        response.status(500);
      }
    });
  }
}
