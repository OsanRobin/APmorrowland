sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/m/ViewSettingsDialog",
  "sap/m/ViewSettingsItem",
  "sap/m/ViewSettingsFilterItem"
], function (Controller, Filter, FilterOperator, Sorter, ViewSettingsDialog, ViewSettingsItem, ViewSettingsFilterItem) {
  "use strict";

  return Controller.extend("apm.artist.controller.List", {
    onInit: function () {
      this._oVSD = null;
      this._aSearchFilters = [];
      this._aVsdFilters = [];
      this._aSorters = [];
    },

    onSearch: function (oEvent) {
      const sQuery = (oEvent.getParameter("newValue") || "").trim();
      this._setSearchFilter(sQuery);
    },

    onSearchSubmit: function (oEvent) {
      const sQuery = (oEvent.getParameter("query") || "").trim();
      this._setSearchFilter(sQuery);
    },

    _setSearchFilter: function (sQuery) {
      this._aSearchFilters = sQuery
        ? [new Filter("name", FilterOperator.Contains, sQuery)]
        : [];
      this._applyFiltersAndSort();
    },
onItemPress: function (oEvent) {
  const oItem = oEvent.getParameter("listItem");
  const sID = oItem.getBindingContext().getProperty("ID");
  this.getOwnerComponent().getRouter().navTo("detail", { artistID: sID });
}



,

    _applyFiltersAndSort: function () {
      const oList = this.byId("artistList");
      const oBinding = oList.getBinding("items");
      if (!oBinding) return;

      const aAll = [...this._aSearchFilters, ...this._aVsdFilters];
      oBinding.filter(aAll, "Application");

      if (this._aSorters.length) {
        oBinding.sort(this._aSorters);
      }
    },

    onOpenViewSettings: function () {
      if (!this._oVSD) {
        this._oVSD = new ViewSettingsDialog({
          confirm: this.onConfirmViewSettings.bind(this),
          sortItems: [
            new ViewSettingsItem({ key: "name", text: "Name" }),
            new ViewSettingsItem({ key: "popularityScore", text: "Popularity" }),
            new ViewSettingsItem({ key: "genre", text: "Genre" }),
            new ViewSettingsItem({ key: "country", text: "Country" })
          ],
          filterItems: [
            new ViewSettingsFilterItem({
              key: "genre",
              text: "Genre",
              items: [
                new ViewSettingsItem({ key: "Techno", text: "Techno" }),
                new ViewSettingsItem({ key: "House", text: "House" }),
                new ViewSettingsItem({ key: "EDM", text: "EDM" }),
                new ViewSettingsItem({ key: "Pop", text: "Pop" }),
                new ViewSettingsItem({ key: "Hardstyle", text: "Hardstyle" }),
                new ViewSettingsItem({ key: "Indie", text: "Indie" })
              ]
            }),
            new ViewSettingsFilterItem({
              key: "country",
              text: "Country",
              items: [
                new ViewSettingsItem({ key: "BE", text: "BE" }),
                new ViewSettingsItem({ key: "NL", text: "NL" }),
                new ViewSettingsItem({ key: "DE", text: "DE" }),
                new ViewSettingsItem({ key: "US", text: "US" }),
                new ViewSettingsItem({ key: "UK", text: "UK" }),
                new ViewSettingsItem({ key: "FR", text: "FR" }),
                new ViewSettingsItem({ key: "SE", text: "SE" })
              ]
            })
          ]
        });
      }
      this._oVSD.open();
    },

    onConfirmViewSettings: function (oEvent) {
      const oParams = oEvent.getParameters();

      const sSortKey = oParams.sortItem ? oParams.sortItem.getKey() : "name";
      this._aSorters = [new Sorter(sSortKey, oParams.sortDescending)];

      const aVsdFilters = [];
      const mKeys = oParams.filterKeys || {};
      Object.keys(mKeys).forEach((sProp) => {
        const aKeys = mKeys[sProp];
        if (aKeys && aKeys.length) {
          const aOr = aKeys.map(k => new Filter(sProp, FilterOperator.EQ, k));
          aVsdFilters.push(new Filter({ filters: aOr, and: false }));
        }
      });

      this._aVsdFilters = aVsdFilters;
      this._applyFiltersAndSort();
    }
  });
});
