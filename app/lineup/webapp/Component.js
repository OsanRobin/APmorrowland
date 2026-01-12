sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/odata/v4/ODataModel"
], function (UIComponent, ODataModel) {
  "use strict";

  return UIComponent.extend("apm.lineup.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      // Force default OData V4 model (werkt altijd)
      const oModel = new ODataModel({
        serviceUrl: "/odata/v4/festival/",
        synchronizationMode: "None",
        operationMode: "Server",
        autoExpandSelect: true,
        earlyRequests: true
      });

      this.setModel(oModel); // default model voor view/controller
    }
  });
});
