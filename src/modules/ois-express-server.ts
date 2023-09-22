/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import express, { application } from "express";
import bodyParser from 'body-parser';

import { operationMiddlewares } from "./ois-express-middleware";

/**
 * 
 */

export class OIS_ExpressServer {
  private expressServer = express();
  private enddPoint: string;
  public port: number;

  constructor(endPoint: string, port?: number) {
    this.expressServer.use(bodyParser.json());
    this.enddPoint = endPoint;
    this.port = port;
  }

  public start() {
    this.expressServer.use(this.enddPoint, operationMiddlewares);
    this.expressServer.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    })
  }  
}