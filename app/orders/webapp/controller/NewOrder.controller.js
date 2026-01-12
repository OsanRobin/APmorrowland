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
      const qty = Math.max(1, Math.floor(toNumber(vm.getProperty("/qty"))));
      vm.setProperty("/qty", qty);
      this._validateAll();
    },

    onPriceChange() {
      const vm = this.getView().getModel("vm");
      const unitPrice = Math.max(0, toNumber(vm.getProperty("/unitPrice")));
      vm.setProperty("/unitPrice", unitPrice);
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
      if (qty <= 0) {
        MessageBox.error("Aantal moet groter zijn dan 0.");
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
      const oRow = oEvent.getSource().getParent(); // ColumnListItem
      const oCtx = oRow.getBindingContext("vm");
      const iIndex = Number(oCtx.getPath().split("/").pop());

      const items = vm.getProperty("/items").slice();
      items.splice(iIndex, 1);
      vm.setProperty("/items", items);

      this._recalcTotal();
      this._validateAll();
    },

    _recalcTotal() {
      const vm = this.getView().getModel("vm");
      const items = vm.getProperty("/items") || [];
      const total = round2(items.reduce((s, it) => s + (Number(it.lineTotal) || 0), 0));
      vm.setProperty("/total", total);
    },

    _validateAll() {
      const vm = this.getView().getModel("vm");
      const wiz = this.byId("wiz");

      const step1Valid = !!vm.getProperty("/customerId");
      vm.setProperty("/step1Valid", step1Valid);

      const step2Valid = !!vm.getProperty("/type");
      vm.setProperty("/step2Valid", step2Valid);

      const items = vm.getProperty("/items") || [];
      const step3Valid = items.length > 0 && items.every(it => Number(it.qty) > 0);
      vm.setProperty("/step3Valid", step3Valid);

      if (wiz) {
        const s1 = this.byId("step1");
        const s2 = this.byId("step2");
        const s3 = this.byId("step3");

        step1Valid ? wiz.validateStep(s1) : wiz.invalidateStep(s1);
        step2Valid ? wiz.validateStep(s2) : wiz.invalidateStep(s2);
        step3Valid ? wiz.validateStep(s3) : wiz.invalidateStep(s3);
      }
    },

    _toDateOnly(d) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    },

    async onSubmit() {
      const vm = this.getView().getModel("vm");

      if (!vm.getProperty("/step1Valid")) {
        return MessageBox.error("Kies een klant.");
      }
      if (!vm.getProperty("/step3Valid")) {
        return MessageBox.error("Voeg minstens één item toe.");
      }

      const payload = {
        orderDate: this._toDateOnly(new Date()),
        status: "OPEN",
        type: vm.getProperty("/type"),
        customer_ID: vm.getProperty("/customerId"),
        total: vm.getProperty("/total"),
        items: (vm.getProperty("/items") || []).map(it => ({
          name: it.name,
          qty: it.qty,
          unitPrice: it.unitPrice,
          lineTotal: it.lineTotal
        }))
      };

      try {
        const oModel = this.getView().getModel();
        const oOrders = oModel.bindList("/Orders");
        const oCtx = oOrders.create(payload);
        await oCtx.created();

        await oModel.refresh();
        MessageToast.show("Order aangemaakt");

        
        this.getOwnerComponent().getRouter().navTo("OrderList", {}, true);
      } catch (e) {
        this.getView().getModel().resetChanges();
        MessageBox.error("Order aanmaken mislukt: " + (e.message || e));
      }
    },

    onCancel() {
      this.getOwnerComponent().getRouter().navTo("OrderList", {}, true);
    }

  });
});
