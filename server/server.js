const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
require("./Models/index");

const server = require("./app");

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("💥Server Fired. PORT : ", process.env.PORT);
});
