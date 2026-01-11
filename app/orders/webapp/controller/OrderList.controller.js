sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, Sorter) {
  "use strict";

  return Controller.extend("apm.orders.controller.OrderList", {
    onInit() {
      this._sSearch = "";
      this._sStatus = "";
      this._sType = "";
      this._bSortDesc = true;
    },

    onSearch(oEvent) {
      this._sSearch = (oEvent.getParameter("newValue") || "").trim();
      this._applyAll();
    },

    onFilterStatus(oEvent) {
      this._sStatus = oEvent.getSource().getSelectedKey();
      this._applyAll();
    },

    onFilterType(oEvent) {
      this._sType = oEvent.getSource().getSelectedKey();
      this._applyAll();
    },

    _applyAll() {
      const aFilters = [];

      if (this._sSearch) {
        aFilters.push(new Filter("customer/name", FilterOperator.Contains, this._sSearch));
      }
      if (this._sStatus) {
        aFilters.push(new Filter("status", FilterOperator.EQ, this._sStatus));
      }
      if (this._sType) {
        aFilters.push(new Filter("type", FilterOperator.EQ, this._sType));
      }

      const oList = this.byId("ordersList");
      const oBinding = oList && oList.getBinding("items");
      if (oBinding) {
        oBinding.filter(aFilters);
      }
    },

    onSortByDate() {
      this._bSortDesc = !this._bSortDesc;
      const oBinding = this.byId("ordersList").getBinding("items");
      oBinding.sort(new Sorter("orderDate", this._bSortDesc));
    },

    onSelectOrder(oEvent) {
      const oItem = oEvent.getParameter("listItem");
      const oCtx = oItem && oItem.getBindingContext();
      if (!oCtx) return;

      const sID = oCtx.getProperty("ID");
      this.getOwnerComponent().getRouter().navTo("OrderDetail", { ID: sID });
    },

    onCreateOrder() {
      const oList = this.byId("ordersList");
      const oBinding = oList.getBinding("items");

      const oCtx = oBinding.create({
        orderDate: new Date(),
        status: "OPEN",
        type: "TICKETS",
        total: 0
      });

      oCtx.created().then(() => {
        this.getOwnerComponent().getRouter().navTo("OrderDetail", { ID: oCtx.getProperty("ID") });
      });
    }
  });
});
