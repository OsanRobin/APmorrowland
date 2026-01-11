sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("apm.orders.controller.OrderDetail", {
    onInit() {
      this.getOwnerComponent()
        .getRouter()
        .getRoute("OrderDetail")
        .attachPatternMatched(this._onMatched, this);
    },

    _onMatched(oEvent) {
      const sID = oEvent.getParameter("arguments").ID;

      this.getView().bindElement({
        path: "/Orders('" + sID + "')",
        parameters: {
          $expand: "customer,items"
        }
      });
    },

    onBack() {
      this.getOwnerComponent().getRouter().navTo("OrderList");
    }
  });
});
