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

    onAfterRendering() {
      const oList = this.byId("ordersList");
      const oBinding = oList.getBinding("items");
      if (oBinding) {
        oBinding.changeParameters({ $expand: "customer" });
      }
    },

    onSearch(oEvent) {
      const sQuery = oEvent.getParameter("query");
      const aFilters = [];

      if (sQuery) {
        aFilters.push(
          new Filter("customer/name", FilterOperator.Contains, sQuery)
        );
      }

      this._applyFilters(aFilters);
    },

    onFilterStatus(oEvent) {
      const sKey = oEvent.getSource().getSelectedKey();
      const a = [];

      if (sKey) {
        a.push(new Filter("status", FilterOperator.EQ, sKey));
      }

      this._applyFilters(a, true);
    },

    onFilterType(oEvent) {
      const sKey = oEvent.getSource().getSelectedKey();
      const a = [];

      if (sKey) {
        a.push(new Filter("type", FilterOperator.EQ, sKey));
      }

      this._applyFilters(a, true);
    },

    _applyFilters(aNew, bMerge) {
      if (!bMerge) {
        this._aFilters = aNew;
      } else {
        this._aFilters = this._aFilters
          .filter(f => f.sPath === "customer/name")
          .concat(aNew);
      }

      this.byId("ordersList")
        .getBinding("items")
        .filter(this._aFilters);
    },

    onSortByDate() {
      this._bSortDesc = !this._bSortDesc;
      this.byId("ordersList")
        .getBinding("items")
        .sort(new Sorter("orderDate", this._bSortDesc));
    },

    onSelectOrder(oEvent) {
      const oCtx = oEvent.getParameter("listItem").getBindingContext();
      const sID = oCtx.getProperty("ID");

      this.getOwnerComponent()
        .getRouter()
        .navTo("RouteOrderDetail", { ID: sID });
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
        this.getOwnerComponent()
          .getRouter()
          .navTo("RouteOrderDetail", {
            ID: oCtx.getProperty("ID")
          });
      });
    }

  });
});
