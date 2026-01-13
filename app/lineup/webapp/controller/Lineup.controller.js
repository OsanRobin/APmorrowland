sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/UIComponent",
  "sap/ui/core/routing/History",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, JSONModel, UIComponent, History, Filter, FilterOperator, MessageBox, MessageToast) {
  "use strict";

  return Controller.extend("apm.lineup.controller.Lineup", {
    onInit: function () {
      this._oFixedStart = new Date(2026, 0, 1, 11, 0, 0);

      var oFiltersModel = new JSONModel({
        stages: [{ ID: "", stageNaam: "Alle stages" }],
        artiesten: [{ ID: "", artiestNaam: "Alle artiesten" }],
        views: [
          { key: "Day", text: "Dag" },
          { key: "Week", text: "Week" }
        ],
        selectedStageId: "",
        selectedArtiestId: ""
      });
      this.getView().setModel(oFiltersModel, "filters");

      var oLineUpModel = new JSONModel({
        startDate: this._oFixedStart,
        viewKey: "Day",
        rows: []
      });
      this.getView().setModel(oLineUpModel, "lineup");

      this._initLineUp();
    },

    _initLineUp: async function () {
      try {
        await this._loadFilterData();
        await this._loadLineUp();
        this._applyFixedStart();
      } catch (e) {
        console.error("LineUp init error:", e);
        MessageBox.error(e?.message || String(e));
      }
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      var sPrevHash = oHistory.getPreviousHash();
      if (sPrevHash !== undefined) {
        window.history.go(-1);
        return;
      }
     
      try {
        UIComponent.getRouterFor(this).navTo("RouteHome", {}, true);
      } catch (e) {
        MessageToast.show("Geen vorige pagina.");
      }
    },

    onRefresh: function () {
      this._loadLineUp()
        .then(this._applyFixedStart.bind(this))
        .then(function () { MessageToast.show("Vernieuwd"); })
        .catch(function (e) { MessageBox.error(e?.message || String(e)); });
    },

    onFilterChange: function () {
      this._loadLineUp()
        .then(this._applyFixedStart.bind(this))
        .catch(function (e) { MessageBox.error(e?.message || String(e)); });
    },

    onViewChange: function (oEvent) {
      var sKey = oEvent.getSource().getSelectedKey();
      this.getView().getModel("lineup").setProperty("/viewKey", sKey);
      this._applyFixedStart();
    },

    onAppointmentSelect: function (oEvent) {
      var oAppt = oEvent.getParameter("appointment");
      if (!oAppt) return;

      var oCtx = oAppt.getBindingContext("lineup");
      if (!oCtx) return;

      var o = oCtx.getObject() || {};
      MessageBox.information(
        [
          "Artiest: " + (o.artiestNaam || ""),
          "Genre: " + (o.genre || ""),
          "Stage: " + (o.stageNaam || ""),
          "Dag: " + (o.dagLabel || o.datum || ""),
          "Tijd: " + this._fmtTimeRange(o.startTijd, o.eindTijd)
        ].join("\n")
      );
    },

    _applyFixedStart: function () {
      var oCal = this.byId("pcLineUp");
      var oLineUpModel = this.getView().getModel("lineup");

      if (oLineUpModel) {
        oLineUpModel.setProperty("/startDate", this._oFixedStart);
      }
      if (oCal && oCal.setStartDate) {
        oCal.setStartDate(this._oFixedStart);
      }
    },

    _getODataModel: function () {
    
      return this.getView().getModel() || sap.ui.getCore().getModel();
    },

    _loadFilterData: async function () {
      var oModel = this._getODataModel();
      if (!oModel) throw new Error("Geen OData model beschikbaar.");

      var oFiltersModel = this.getView().getModel("filters");

      var aStages = await this._requestAll(
        oModel,
        "/Stages",
        { $select: "ID,name", $orderby: "name asc" },
        [],
        2000
      );

      var aArtists = await this._requestAll(
        oModel,
        "/Artists",
        { $select: "ID,name", $orderby: "name asc" },
        [],
        5000
      );

      oFiltersModel.setProperty(
        "/stages",
        [{ ID: "", stageNaam: "Alle stages" }].concat(
          aStages.map(function (o) {
            return { ID: String(o.ID), stageNaam: o.name };
          })
        )
      );

      oFiltersModel.setProperty(
        "/artiesten",
        [{ ID: "", artiestNaam: "Alle artiesten" }].concat(
          aArtists.map(function (o) {
            return { ID: String(o.ID), artiestNaam: o.name };
          })
        )
      );
    },

  _loadLineUp: async function () {
  var oModel = this._getODataModel();
  if (!oModel) throw new Error("Geen OData model beschikbaar.");

  var oView = this.getView();
  var oFiltersModel = oView.getModel("filters");
  var oLineUpModel = oView.getModel("lineup");

  var sStageId = (oFiltersModel.getProperty("/selectedStageId") || "").trim();
  var sArtistId = (oFiltersModel.getProperty("/selectedArtiestId") || "").trim();

  
  var aStages = await this._requestAll(oModel, "/Stages", { $select: "ID,name" }, [], 2000);
  var aArtists = await this._requestAll(oModel, "/Artists", { $select: "ID,name,genre" }, [], 5000);
  var aDays = await this._requestAll(oModel, "/FestivalDays", { $select: "ID,label,date", $orderby: "date asc" }, [], 200);

  var mStage = new Map(aStages.map(s => [String(s.ID), s]));
  var mArtist = new Map(aArtists.map(a => [String(a.ID), a]));
  var mDay = new Map(aDays.map(d => [String(d.ID), d]));

 
  var aFilters = [];
  if (sStageId) aFilters.push(new Filter("stage_ID", FilterOperator.EQ, sStageId));
  if (sArtistId) aFilters.push(new Filter("artist_ID", FilterOperator.EQ, sArtistId));

  var aPerf = await this._requestAll(
    oModel,
    "/Performances",
    { $select: "ID,artist_ID,stage_ID,day_ID,startTime,endTime" },
    aFilters,
    10000
  );

  console.log("Performances loaded:", aPerf.length, aPerf[0]);


  var mByStage = new Map();

  aStages.forEach(function (s) {
    mByStage.set(String(s.ID), {
      stageId: s.ID,
      stageNaam: s.name,
      stageSubText: "",
      appointments: []
    });
  });

  aPerf.forEach(function (p) {
    var oStage = mStage.get(String(p.stage_ID));
    var oArtist = mArtist.get(String(p.artist_ID));
    var oDay = mDay.get(String(p.day_ID));

    if (!oStage || !oArtist || !oDay) return;

    var oDates = this._buildStartEnd(oDay.date, p.startTime, p.endTime);
    if (!oDates) return;

    var sTime = this._fmtTimeRange(p.startTime, p.endTime);

    var oRow = mByStage.get(String(oStage.ID));
    if (!oRow) return;

    oRow.appointments.push({
      title: (oArtist.name || "Onbekend") + " (" + sTime + ")",
      text: oArtist.genre || "",
      startDate: oDates.start,
      endDate: oDates.end,

      artiestNaam: oArtist.name,
      genre: oArtist.genre,
      stageNaam: oStage.name,
      dagLabel: oDay.label,
      datum: oDay.date,
      startTijd: p.startTime,
      eindTijd: p.endTime
    });
  }.bind(this));

 
  var aRows = Array.from(mByStage.values());
  aRows.sort((a, b) => String(a.stageNaam).localeCompare(String(b.stageNaam)));
  aRows.forEach(r => r.appointments.sort((a, b) => a.startDate - b.startDate));


  if (aDays.length && aDays[0].date) {
    var d0 = String(aDays[0].date).split("-");
    if (d0.length === 3) {
      this._oFixedStart = new Date(parseInt(d0[0], 10), parseInt(d0[1], 10) - 1, parseInt(d0[2], 10), 11, 0, 0);
    }
  }

  oLineUpModel.setProperty("/rows", aRows);
  oLineUpModel.setProperty("/startDate", this._oFixedStart);
  this._applyFixedStart();
},
    _requestAll: async function (oModel, sPath, mQueryOptions, aFilters, iMax) {
      var mParameters = Object.assign({ $$operationMode: "Server" }, mQueryOptions || {});
      var oBind = oModel.bindList(sPath, null, null, aFilters || [], mParameters);
      var aCtx = await oBind.requestContexts(0, iMax || 1000);
      return aCtx.map(function (oCtx) { return oCtx.getObject(); });
    },

    _buildStartEnd: function (sDate, sStartTime, sEndTime) {
      if (!sDate || !sStartTime || !sEndTime) return null;

      var aDate = String(sDate).split("-");
      if (aDate.length !== 3) return null;

      var iY = parseInt(aDate[0], 10);
      var iM = parseInt(aDate[1], 10) - 1;
      var iD = parseInt(aDate[2], 10);

      var oStart = this._dateWithTime(iY, iM, iD, sStartTime);
      var oEnd = this._dateWithTime(iY, iM, iD, sEndTime);
      if (!oStart || !oEnd) return null;

      if (oEnd.getTime() <= oStart.getTime()) {
        oEnd = new Date(oEnd.getTime());
        oEnd.setDate(oEnd.getDate() + 1);
      }

      return { start: oStart, end: oEnd };
    },

    _dateWithTime: function (iY, iM, iD, sTime) {
      var aParts = String(sTime).split(":");
      if (aParts.length < 2) return null;

      var iH = parseInt(aParts[0], 10);
      var iMin = parseInt(aParts[1], 10);

      var sSecPart = aParts[2] || "0";
      var iSec = parseInt(String(sSecPart).split(".")[0], 10);

      if (isNaN(iH) || isNaN(iMin) || isNaN(iSec)) return null;

      return new Date(iY, iM, iD, iH, iMin, iSec);
    },

    _fmtTimeRange: function (sStartTime, sEndTime) {
      return this._hhmm(sStartTime) + "–" + this._hhmm(sEndTime);
    },

    _hhmm: function (sTime) {
      var a = String(sTime).split(":");
      if (a.length < 2) return String(sTime);
      return String(a[0]).padStart(2, "0") + ":" + String(a[1]).padStart(2, "0");
    }
  });
});
