const user = require("./user");
const scenario = require("./scenario");
const solver = require("./solver");
const admin = require("./admin");

module.exports = (app) => {
  app.use("/user", user);
  app.use("/scenarios", scenario);
  app.use("/admin", admin);
  app.use("/solver", solver);
};
