sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  "use strict";

  return Controller.extend("apm.orders.controller.App", {

    onInit: function () {
      this.getView().setModel(new JSONModel({ orders: [], error: "" }), "vm");
    },

    onLoadOrders: async function () {
      const oVM = this.getView().getModel("vm");
      oVM.setProperty("/error", "");
      oVM.setProperty("/orders", []);

      try {
        const res = await fetch("/odata/v4/festival/Orders");
        if (!res.ok) {
          oVM.setProperty("/error", "Fetch failed: " + res.status + " " + res.statusText);
          return;
        }
        const data = await res.json();
        oVM.setProperty("/orders", data.value || []);
      } catch (e) {
        oVM.setProperty("/error", String(e));
      }
    }

  });
});
