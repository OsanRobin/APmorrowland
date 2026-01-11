sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("apm.orders.controller.App", {
    onPing: function () {
      alert("Ping ");
    }
  });
});
