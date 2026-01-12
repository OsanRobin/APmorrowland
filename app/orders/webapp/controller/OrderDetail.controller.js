sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
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
      const oFCL = this.getOwnerComponent()
        .getRootControl()
        .byId("ordersFcl");

      if (oFCL) {
        oFCL.setLayout("OneColumn");
      }

      const oRouter = this.getOwnerComponent().getRouter();

      if (oRouter.getRoute("OrderList")) {
        oRouter.navTo("OrderList", {}, true);
      } else if (oRouter.getRoute("Orders")) {
        oRouter.navTo("Orders", {}, true);
      }
    }

  });
});
