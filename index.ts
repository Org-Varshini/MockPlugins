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

import "dotenv/config";
import process from "process";

// import { readFileSync } from "fs";
import * as path from "path";
// import https from "https";

import express from "express";
import cors from "cors";
import {
  ViewsController,
  PluginsController,
  SdkController,
} from "./controllers/index.js";

process.on("uncaughtException", (error) => {
  console.error("Uncaught error", error);
});

// const API_PROTOCOL = "https";
// const API_HOST_NAME = process.env.API_HOST_NAME;
// const API_PORT = Number(process.env.API_PORT);

const DIST_DIRECTORY = "dist";
const APPS_DIRECTORY = "plugins";
const SDK_DIRECTORY = "sdk";
// const SSL_DIRECTORY = "ssl";

const {
  rootDirectory,
  distDirectory,
  appsDirectory,
  distAppsDirectory,
  // sslDirectory,
} = getDirectories();

// const key = readFileSync(path.join(sslDirectory, "key.pem"), "utf8");
// const cert = readFileSync(path.join(sslDirectory, "cert.pem"), "utf8");

function getDirectories() {
  const rootDirectory = process.cwd();
  const distDirectory = path.join(rootDirectory, DIST_DIRECTORY);
  const appsDirectory = path.join(rootDirectory, APPS_DIRECTORY);
  const distAppsDirectory = path.join(distDirectory, APPS_DIRECTORY);
  // const sslDirectory = path.join(rootDirectory, SSL_DIRECTORY);

  return {
    rootDirectory,
    distDirectory,
    appsDirectory,
    distAppsDirectory,
    // sslDirectory,
  };
}

function startApiServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const viewsController = ViewsController.instance;
  viewsController.viewsDirectory = distDirectory;
  viewsController.register(app);

  const pluginsController = PluginsController.instance;
  pluginsController.pluginsDirectory = appsDirectory;
  pluginsController.distPluginsDirectory = distAppsDirectory;
  pluginsController.register(app);

  const sdkController = SdkController.instance;
  sdkController.sdkDirectory = path.join(rootDirectory, SDK_DIRECTORY);
  sdkController.register(app);

  // const secureApiServer = https.createServer({ key, cert }, app);
  // secureApiServer.listen(process.env.PORT || API_PORT);
  // secureApiServer.listen(API_PORT, API_HOST_NAME);

  // console.log(`API URL: ${API_PROTOCOL}://${API_HOST_NAME}:${API_PORT}`);
}

startApiServer();
