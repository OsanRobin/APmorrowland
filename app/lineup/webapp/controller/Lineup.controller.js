sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, MessageToast) {
  "use strict";

  return Controller.extend("apm.lineup.controller.Lineup", {

    onInit: function () {
      this._setDummyData();
      this._applySelectedDay();
    },

    onRefresh: function () {
    
      MessageToast.show("Refreshed ");
      this._applySelectedDay();
    },

    onDayChange: function () {
      this._applySelectedDay();
    },

    onPerformancePress: function (oEvent) {
      const oPerf = oEvent.getSource().getBindingContext("vm").getObject();
      MessageBox.information(
        `${oPerf.artist}\nGenre: ${oPerf.genre}\nTijd: ${oPerf.start} - ${oPerf.end}`
      );
    },

    _setDummyData: function () {
      const oVM = new JSONModel({
        days: [
          { id: "fri", label: "Vrijdag" },
          { id: "sat", label: "Zaterdag" }
        ],
        selectedDayId: "fri",

        stagesByDay: {
          fri: [
            {
              name: "Mainstage",
              performances: [
                { artist: "Aurora Nova", genre: "Pop", start: "18:00", end: "19:00" },
                { artist: "The Paper Planes", genre: "Indie", start: "19:15", end: "20:15" }
              ]
            },
            {
              name: "Techno Dome",
              performances: [
                { artist: "DJ Nightshift", genre: "Techno", start: "18:30", end: "20:00" },
                { artist: "Bassline Riot", genre: "D&amp;B", start: "20:00", end: "21:00" }
              ]
            }
          ],
          sat: [
            {
              name: "Mainstage",
              performances: [
                { artist: "Sunset Strings", genre: "Indie", start: "17:30", end: "18:30" },
                { artist: "Aurora Nova", genre: "Pop", start: "20:30", end: "21:30" }
              ]
            },
            {
              name: "Techno Dome",
              performances: [
                { artist: "Kinetic K", genre: "Techno", start: "19:00", end: "20:30" }
              ]
            }
          ]
        },

        stages: []
      });

      this.getView().setModel(oVM, "vm");
    },

    _applySelectedDay: function () {
      const oVM = this.getView().getModel("vm");
      const sDay = oVM.getProperty("/selectedDayId");
      const aStages = oVM.getProperty("/stagesByDay/" + sDay) || [];
      oVM.setProperty("/stages", aStages);
    }

  });
});
