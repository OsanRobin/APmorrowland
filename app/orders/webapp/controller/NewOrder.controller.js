sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
  "use strict";

  function toNumber(v) {
    const n = Number(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  return Controller.extend("apm.orders.controller.NewOrder", {

    onInit() {
      const oVM = new JSONModel({
        customerId: "",
        type: "TICKETS",
        itemName: "",
        qty: 1,
        unitPrice: 0,
        lineTotal: 0,
        total: 0
      });
      this.getView().setModel(oVM, "vm");
      this.onRecalc();
    },

    _toDateOnly(d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },

    onCustomerChange() {
      // nothing else needed
    },

    onTypeChange(oEvent) {
      const sType = oEvent.getSource().getSelectedKey();
      this.getView().getModel("vm").setProperty("/type", sType);
    },

    onRecalc() {
      const oVM = this.getView().getModel("vm");
      const qty = Math.max(1, toNumber(oVM.getProperty("/qty")));
      const unitPrice = toNumber(oVM.getProperty("/unitPrice"));
      const lineTotal = Math.round(qty * unitPrice * 100) / 100;

      oVM.setProperty("/qty", qty);
      oVM.setProperty("/unitPrice", unitPrice);
      oVM.setProperty("/lineTotal", lineTotal);
      oVM.setProperty("/total", lineTotal);
    },

    async onSubmit() {
      const oVM = this.getView().getModel("vm");

      const customerId = oVM.getProperty("/customerId");
      const type = oVM.getProperty("/type");
      const itemName = String(oVM.getProperty("/itemName") || "").trim();
      const qty = toNumber(oVM.getProperty("/qty"));
      const unitPrice = toNumber(oVM.getProperty("/unitPrice"));
      const total = toNumber(oVM.getProperty("/total"));

      if (!customerId) {
        MessageBox.error("Kies een klant.");
        return;
      }
      if (!itemName) {
        MessageBox.error("Vul een item naam in.");
        return;
      }
      if (qty <= 0) {
        MessageBox.error("Aantal moet > 0 zijn.");
        return;
      }

      const payload = {
        orderDate: this._toDateOnly(new Date()),  
        status: "OPEN",
        type,
        customer_ID: customerId,
        total,
        items: [
          {
            name: itemName,
            qty,
            unitPrice,
            lineTotal: total
          }
        ]
      };

      try {
        const oModel = this.getView().getModel();
        const oOrders = oModel.bindList("/Orders");
        const oCtx = oOrders.create(payload);
        await oCtx.created();

        const sID = oCtx.getProperty("ID");
        MessageToast.show("Order aangemaakt");

        const oFCL = this.getOwnerComponent().getRootControl().byId("ordersFcl");
        if (oFCL) oFCL.setLayout("TwoColumnsMidExpanded");

        this.getOwnerComponent().getRouter().navTo("OrderDetail", { ID: sID });
      } catch (e) {
        this.getView().getModel().resetChanges();
        MessageBox.error("Order aanmaken mislukt: " + (e.message || e));
      }
    },

    onCancel() {
      this.getOwnerComponent().getRouter().navTo("OrderList");
    }

  });
});
