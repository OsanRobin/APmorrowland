sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/m/ViewSettingsDialog",
  "sap/m/ViewSettingsItem",
  "sap/m/ViewSettingsFilterItem"
], function (
  Controller,
  Filter,
  FilterOperator,
  Sorter,
  JSONModel,
  Fragment,
  MessageBox,
  MessageToast,
  ViewSettingsDialog,
  ViewSettingsItem,
  ViewSettingsFilterItem
) {
  "use strict";


  return Controller.extend("apm.artist.controller.List", {
    onInit: function () {
      this._oVSD = null;
      this._aSearchFilters = [];
      this._aVsdFilters = [];
      this._aSorters = [];
this.getView().setModel(new JSONModel({
  name: "",
  genre: "",
  country: "",
  bio: "",
  dayID: "",
  stageID: "",
  startTime: "18:00:00",
  endTime: "19:00:00"
}), "artistForm");


  this._oAddArtistDialog = null;
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
onOpenAddArtist: async function () {
  this.getView().getModel("artistForm").setData({
    name: "",
    genre: "",
    country: "",
    bio: "",
    dayID: "",
    stageID: "",
    startTime: "18:00:00",
    endTime: "19:00:00"
  });

  if (!this._oAddArtistDialog) {
    this._oAddArtistDialog = await Fragment.load({
      id: this.getView().getId(),
      name: "apm.artist.view.fragments.AddArtistDialog",
      controller: this
    });
    this.getView().addDependent(this._oAddArtistDialog);
  }

  this._oAddArtistDialog.open();
},

onCancelAddArtist: function () {
  if (this._oAddArtistDialog) this._oAddArtistDialog.close();
},
onSaveArtist: async function () {
  const oForm = this.getView().getModel("artistForm").getData();
  const oModel = this.getView().getModel();

  const sName = (oForm.name || "").trim();
  const sGenre = (oForm.genre || "").trim();
  const sCountry = (oForm.country || "").trim();

  if (!sName || !sGenre || !sCountry) {
    MessageBox.warning("Please fill in Name, Genre and Country.");
    return;
  }
  if (!oForm.dayID || !oForm.stageID || !oForm.startTime || !oForm.endTime) {
    MessageBox.warning("Please select Day, Stage, Start time and End time.");
    return;
  }

  try {
    const oArtists = oModel.bindList("/Artists");
    const oArtistCtx = oArtists.create({
      name: sName,
      genre: sGenre,
      country: sCountry,
      bio: (oForm.bio || "").trim(),
      popularityScore: 0
    });
    await oArtistCtx.created();

    const sArtistID = oArtistCtx.getProperty("ID");


    const oPerfs = oModel.bindList("/Performances");
    const oPerfCtx = oPerfs.create({
      artist_ID: sArtistID,
      day_ID: oForm.dayID,
      stage_ID: oForm.stageID,
      startTime: oForm.startTime,
      endTime: oForm.endTime
    });
    await oPerfCtx.created();

    MessageToast.show("Artist created with first performance.");

    this._oAddArtistDialog.close();

    await oModel.refresh();
  } catch (e) {
    console.error(e);
    MessageBox.error("Could not create artist/performance. Check service and field names.");
  }
},
onGoLeaderboard: function () {
  this.getOwnerComponent().getRouter().navTo("Leaderboard");
},


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
