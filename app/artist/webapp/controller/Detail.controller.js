sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History"
], function (Controller, History) {
  "use strict";

  return Controller.extend("apm.artist.controller.Detail", {
    onInit: function () {},

    onNavBack: function () {
      const sPrev = History.getInstance().getPreviousHash();
      if (sPrev !== undefined) window.history.go(-1);
      else this.getOwnerComponent().getRouter().navTo("list", {}, true);
    }
  });
});
