sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History"
], function (Controller, JSONModel, History) {
  "use strict";

  return Controller.extend("apm.artist.controller.Detail", {
    onInit: function () {
  
      this.getView().setModel(new JSONModel({
        avgRating: 0,
        reviewCount: 0
      }), "view");

      this.getOwnerComponent().getRouter().getRoute("detail")
        .attachPatternMatched(this._onMatched, this);
    },

_onMatched: function (oEvent) {
  const sID = oEvent.getParameter("arguments").artistID; // moet "a1" zijn
const sParam = oEvent.getParameter("arguments").artistID;
  console.log("DETAIL artistID param =", sParam);

  // protect: als er toch nog per ongeluk een path binnenkomt, haal laatste stuk eruit
  const sCleanID = (sID || "").split("/").pop().replace(/[()'"]/g, "");

  const sPath = "/Artists(ID='" + sCleanID + "')";
  this.getView().bindElement({
    path: sPath,
    parameters: { "$expand": "reviews,performances($expand=day,stage)" },
    events: { dataReceived: () => this._recalcRating() }
  });
}




,

    _recalcRating: function () {
      const oCtx = this.getView().getBindingContext();
      const oVM = this.getView().getModel("view");
      if (!oCtx) return;

      const aReviews = oCtx.getProperty("reviews") || [];
      const iCount = aReviews.length;
      const fAvg = iCount
        ? aReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / iCount
        : 0;

      oVM.setProperty("/reviewCount", iCount);
      oVM.setProperty("/avgRating", Math.round(fAvg * 10) / 10); // 1 decimal
    },

    onNavBack: function () {
      const sPrev = History.getInstance().getPreviousHash();
      if (sPrev !== undefined) window.history.go(-1);
      else this.getOwnerComponent().getRouter().navTo("list", {}, true);
    }
  });
});
