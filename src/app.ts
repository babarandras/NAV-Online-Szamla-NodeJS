/* eslint-disable @typescript-eslint/no-unused-vars */

import { OIS_ExpressServer } from "./modules/ois-express-server";

// ----------------------------------------------------------------

const server = new OIS_ExpressServer('/v1/ois/v3/', 3000);
server.start();
