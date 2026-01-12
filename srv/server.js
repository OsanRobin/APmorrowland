const cds = require("@sap/cds");
const express = require("express");
const path = require("path");

cds.on("bootstrap", (app) => {
  app.use(
    "/apm.orders",
    express.static(path.join(__dirname, "../app/orders/webapp"))
  );

  app.use(
    "/apm.lineup",
    express.static(path.join(__dirname, "../app/lineup/webapp"))
  );

  app.use(
    "/apm.artist",
    express.static(path.join(__dirname, "../app/artist/webapp"))
  );
});

module.exports = cds.server;
