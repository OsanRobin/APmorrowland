sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
  "use strict";

  const toNumber = (v) => {
    const n = Number(String(v ?? "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  return Controller.extend("apm.orders.controller.NewOrderWizard", {

    onInit() {
      const vm = new JSONModel({
        step1Valid: false,
        step2Valid: true,
        step3Valid: false,
        customerId: "",
        customerName: "",
        type: "TICKETS",
        itemName: "",
        qty: 1,
        unitPrice: 0,
        items: [],
        total: 0
      });

      this.getView().setModel(vm, "vm");
      this._validateAll();
    },

    onCustomerChange(oEvent) {
      const vm = this.getView().getModel("vm");
      const sId = oEvent.getSource().getSelectedKey();
      vm.setProperty("/customerId", sId);
      const oItem = oEvent.getSource().getSelectedItem();
      vm.setProperty("/customerName", oItem ? oItem.getText() : "");
      this._validateAll();
    },

    onTypeChange(oEvent) {
      const vm = this.getView().getModel("vm");
      vm.setProperty("/type", oEvent.getSource().getSelectedKey());
      vm.setProperty("/itemName", "");
      vm.setProperty("/qty", 1);
      vm.setProperty("/unitPrice", 0);
      vm.setProperty("/items", []);
      vm.setProperty("/total", 0);
      this._validateAll();
    },

    onItemInputChange() {
      this._validateAll();
    },

    onQtyChange() {
      const vm = this.getView().getModel("vm");
      vm.setProperty("/qty", Math.max(1, Math.floor(toNumber(vm.getProperty("/qty")))));
      this._validateAll();
    },

    onPriceChange() {
      const vm = this.getView().getModel("vm");
      vm.setProperty("/unitPrice", Math.max(0, toNumber(vm.getProperty("/unitPrice"))));
      this._validateAll();
    },

    onAddItem() {
      const vm = this.getView().getModel("vm");
      const name = String(vm.getProperty("/itemName") || "").trim();
      const qty = Math.max(1, Math.floor(toNumber(vm.getProperty("/qty"))));
      const unitPrice = Math.max(0, toNumber(vm.getProperty("/unitPrice")));

      if (!name) {
        MessageBox.error("Vul een item naam in.");
        return;
      }

      const lineTotal = round2(qty * unitPrice);
      const items = vm.getProperty("/items").slice();

      items.push({
        name,
        qty,
        unitPrice: round2(unitPrice),
        lineTotal
      });

      vm.setProperty("/items", items);
      vm.setProperty("/itemName", "");
      vm.setProperty("/qty", 1);
      vm.setProperty("/unitPrice", 0);

      this._recalcTotal();
      this._validateAll();

      MessageToast.show("Item toegevoegd");
    },

    onRemoveItem(oEvent) {
      const vm = this.getView().getModel("vm");
      const oCtx = oEvent.getSource().getParent().getBindingContext("vm");
      const i = Number(oCtx.getPath().split("/").pop());
      const items = vm.getProperty("/items").slice();
      items.splice(i, 1);
      vm.setProperty("/items", items);
      this._recalcTotal();
      this._validateAll();
    },

    _recalcTotal() {
      const vm = this.getView().getModel("vm");
      const total = round2((vm.getProperty("/items") || []).reduce((s, it) => s + (Number(it.lineTotal) || 0), 0));
      vm.setProperty("/total", total);
    },

    _validateAll() {
      const vm = this.getView().getModel("vm");
      const wiz = this.byId("wiz");

      vm.setProperty("/step1Valid", !!vm.getProperty("/customerId"));
      vm.setProperty("/step2Valid", !!vm.getProperty("/type"));
      vm.setProperty("/step3Valid", (vm.getProperty("/items") || []).length > 0);

      if (wiz) {
        vm.getProperty("/step1Valid") ? wiz.validateStep(this.byId("step1")) : wiz.invalidateStep(this.byId("step1"));
        wiz.validateStep(this.byId("step2"));
        vm.getProperty("/step3Valid") ? wiz.validateStep(this.byId("step3")) : wiz.invalidateStep(this.byId("step3"));
      }
    },

    _toDateOnly(d) {
      return d.toISOString().split("T")[0];
    },

    async onSubmit() {
      const vm = this.getView().getModel("vm");

      const payload = {
        orderDate: this._toDateOnly(new Date()),
        status: "OPEN",
        type: vm.getProperty("/type"),
        customer_ID: vm.getProperty("/customerId"),
        total: vm.getProperty("/total"),
        items: vm.getProperty("/items")
      };

      try {
        const oModel = this.getView().getModel();
        const oOrders = oModel.bindList("/Orders");
        const oCtx = oOrders.create(payload);
        await oCtx.created();

        const oFCL = this.getOwnerComponent().getRootControl().byId("ordersFcl");
        if (oFCL) oFCL.setLayout("OneColumn");

        const oRouter = this.getOwnerComponent().getRouter();
        if (oRouter.getRoute("OrderList")) {
          oRouter.navTo("OrderList", {}, true);
        } else if (oRouter.getRoute("Orders")) {
          oRouter.navTo("Orders", {}, true);
        } else {
          oRouter.navTo("Main", {}, true);
        }
      } catch (e) {
        this.getView().getModel().resetChanges();
        MessageBox.error("Order aanmaken mislukt");
      }
    },

    onCancel() {
      const oFCL = this.getOwnerComponent().getRootControl().byId("ordersFcl");
      if (oFCL) oFCL.setLayout("OneColumn");

      const oRouter = this.getOwnerComponent().getRouter();
      if (oRouter.getRoute("OrderList")) {
        oRouter.navTo("OrderList", {}, true);
      } else if (oRouter.getRoute("Orders")) {
        oRouter.navTo("Orders", {}, true);
      } else {
        oRouter.navTo("Main", {}, true);
      }
    }

  });
});
