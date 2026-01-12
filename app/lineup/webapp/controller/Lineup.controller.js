sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/odata/v4/ODataModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, JSONModel, ODataModel, Filter, FilterOperator, MessageBox, MessageToast) {
  "use strict";

  return Controller.extend("apm.lineup.controller.Lineup", {

    onInit: function () {
      const oVM = new JSONModel({
        days: [],
        selectedDayId: "",
        stages: []
      });
      this.getView().setModel(oVM, "vm");

      const oOData = new ODataModel({
        serviceUrl: "/odata/v4/festival/",
        synchronizationMode: "None",
        operationMode: "Server",
        autoExpandSelect: true,
        earlyRequests: true
      });
      this.getView().setModel(oOData);

      this._loadInitial().catch(e => MessageBox.error(e?.message || String(e)));
    },

    onRefresh: function () {
      this._loadInitial(true)
        .then(() => MessageToast.show("Refreshed "))
        .catch(e => MessageBox.error(e?.message || String(e)));
    },

    onDayChange: function () {
      this._loadStagesAndPerformances(true)
        .catch(e => MessageBox.error(e?.message || String(e)));
    },

    onPerformancePress: function (oEvent) {
      const oPerf = oEvent.getSource().getBindingContext("vm").getObject();
      MessageBox.information(
        `${oPerf.artistName}\nGenre: ${oPerf.genre}\nStage: ${oPerf.stageName}\nTijd: ${oPerf.start} - ${oPerf.end}`
      );
    },

    _loadInitial: async function () {
      await this._loadDays();

      const oVM = this.getView().getModel("vm");
      if (!oVM.getProperty("/selectedDayId")) {
        const aDays = oVM.getProperty("/days");
        if (aDays.length) {
          oVM.setProperty("/selectedDayId", aDays[0].ID);
        }
      }

      await this._loadStagesAndPerformances();
    },

    _loadDays: async function () {
      const oVM = this.getView().getModel("vm");
      const oModel = this.getView().getModel();

      const aDays = await this._readAll(oModel, "/FestivalDays", {
        $select: "ID,label,date",
        $orderby: "date asc"
      });

      oVM.setProperty("/days", aDays);
    },

    _loadStagesAndPerformances: async function () {
      const oVM = this.getView().getModel("vm");
      const oModel = this.getView().getModel();
      const sDayIdRaw = oVM.getProperty("/selectedDayId");
      const sDayId = this._stripQuotes(sDayIdRaw);

     
      const aStages = await this._readAll(oModel, "/Stages", {
        $select: "ID,name",
        $orderby: "name asc"
      });

      
      let aPerf = [];
      if (sDayId) {
        const oList = oModel.bindList("/Performances", null, null, null, {
          $expand: "artist($select=name,genre),stage($select=ID,name)"
        });

        oList.filter([
          new Filter("day_ID", FilterOperator.EQ, sDayId)
        ]);

        const aCtx = await oList.requestContexts(0, 2000);
        aPerf = aCtx.map(c => c.getObject());
      }

    
      const mStage = new Map();
      aStages.forEach(s => {
        mStage.set(s.ID, { ID: s.ID, name: s.name, performances: [] });
      });

      aPerf.forEach(p => {
        const sStage = p.stage?.ID;
        const oRow = mStage.get(sStage);
        if (!oRow) return;

        oRow.performances.push({
          artistName: p.artist?.name || "Unknown",
          genre: p.artist?.genre || "",
          start: this._fmtTime(p.startTime),
          end: this._fmtTime(p.endTime),
          stageName: p.stage?.name || ""
        });
      });

      const aRows = Array.from(mStage.values()).map(r => {
        r.performances.sort((a, b) => (a.start > b.start ? 1 : -1));
        return r;
      });

      oVM.setProperty("/stages", aRows);
    },

  
    _readAll: async function (oModel, sPath, mParams) {
      const oList = oModel.bindList(sPath, null, null, null, mParams || {});
      const aCtx = await oList.requestContexts(0, 2000);
      return aCtx.map(c => c.getObject());
    },

    _fmtTime: function (vTime) {
      if (!vTime) return "";
      const s = String(vTime);
      const parts = s.split(":");
      return `${parts[0] || "00"}:${parts[1] || "00"}`;
    },

    _stripQuotes: function (v) {
      const s = String(v || "").trim();
      
      const s1 = s.replace(/^guid'/i, "").replace(/'$/i, "");
      
      return s1.replace(/^'+/, "").replace(/'+$/, "").replace(/^"+/, "").replace(/"+$/, "");
    }

  });
});
