sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("apm.artist.controller.Leaderboard", {
    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("list");
    }
  });
});
