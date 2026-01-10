const cds = require("@sap/cds");
const express = require("express");
const path = require("path");

cds.on("bootstrap", (app) => {

  app.use(
    "/apm.orders",
    express.static(path.join(__dirname, "../app/orders/webapp"))
  );
});

module.exports = cds.server;
