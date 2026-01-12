sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("apm.artist.controller.Leaderboard", {
    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("list");
    },onGenreChange: function () {
  const sGenre = this.byId("genreSelect").getSelectedKey();
  const oTable = this.byId("lbTable");
  const oBinding = oTable.getBinding("items");

  if (!oBinding) return;

  if (!sGenre) {
    oBinding.filter([]);
  } else {
    const Filter = sap.ui.require("sap/ui/model/Filter");
    const FilterOperator = sap.ui.require("sap/ui/model/FilterOperator");
    oBinding.filter([new Filter("genre", FilterOperator.EQ, sGenre)]);
  }
}

  });
});
