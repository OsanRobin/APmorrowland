sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, Sorter) {
  "use strict";

  return Controller.extend("apm.orders.controller.OrderList", {

    onInit() {
      this._aFilters = [];
      this._bSortDesc = true;
    },

    onSearch(oEvent) {
      const sQuery = oEvent.getParameter("query") || "";
      const aFilters = [];

      if (sQuery.trim()) {
        aFilters.push(new Filter("customer/name", FilterOperator.Contains, sQuery.trim()));
      }

      this._aFilters = this._aFilters.filter(f => f.sPath !== "customer/name").concat(aFilters);
      this._applyAllFilters();
    },

    onFilterStatus(oEvent) {
      const sKey = oEvent.getSource().getSelectedKey();
      this._aFilters = this._aFilters.filter(f => f.sPath !== "status");
      if (sKey) this._aFilters.push(new Filter("status", FilterOperator.EQ, sKey));
      this._applyAllFilters();
    },

    onFilterType(oEvent) {
      const sKey = oEvent.getSource().getSelectedKey();
      this._aFilters = this._aFilters.filter(f => f.sPath !== "type");
      if (sKey) this._aFilters.push(new Filter("type", FilterOperator.EQ, sKey));
      this._applyAllFilters();
    },

    _applyAllFilters() {
      const oList = this.byId("ordersList");
      if (!oList) return;

      const oBinding = oList.getBinding("items");
      if (!oBinding) return;

      oBinding.filter(this._aFilters);
    },

    onSortByDate() {
      const oList = this.byId("ordersList");
      if (!oList) return;

      const oBinding = oList.getBinding("items");
      if (!oBinding) return;

      this._bSortDesc = !this._bSortDesc;
      oBinding.sort(new Sorter("orderDate", this._bSortDesc));
    },


    onPressOrder(oEvent) {
      const oItem = oEvent.getSource();
      const oCtx = oItem.getBindingContext();
      if (!oCtx) return;

      const sID = oCtx.getProperty("ID");

      const oFCL = this.getOwnerComponent().getRootControl().byId("ordersFcl");
      if (oFCL) oFCL.setLayout("TwoColumnsMidExpanded");

      this.getOwnerComponent().getRouter().navTo("OrderDetail", { ID: sID });
    },

    onCreateOrder() {
  const oFCL = this.getOwnerComponent().getRootControl().byId("ordersFcl");
  if (oFCL) oFCL.setLayout("TwoColumnsMidExpanded");

  this.getOwnerComponent().getRouter().navTo("NewOrder");
}


  });
});
