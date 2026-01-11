sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("apm.orders.controller.OrderDetail", {
    onInit() {
      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("RouteOrderDetail").attachPatternMatched(this._onMatched, this);
    },

    _onMatched(oEvent) {
      const sID = oEvent.getParameter("arguments").ID;
      const sPath = "/Orders('" + sID + "')";

      // Expand customer + items zodat detailpagina alles heeft
      this.getView().bindElement({
        path: sPath,
        parameters: {
          $expand: "customer,items"
        }
      });
    },

    onBack() {
      this.getOwnerComponent().getRouter().navTo("RouteOrderList");
    }
  });
});
