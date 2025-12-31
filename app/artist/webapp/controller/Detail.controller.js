sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function (Controller, JSONModel, History, Fragment, MessageToast, MessageBox) {
  "use strict";

  return Controller.extend("apm.artist.controller.Detail", {
    onInit: function () {
      // ViewModel: computed rating info
      this.getView().setModel(new JSONModel({
        avgRating: 0,
        reviewCount: 0
      }), "view");

      // Review form model for dialog
      this.getView().setModel(new JSONModel({
        customerName: "",
        rating: 0,
        comment: ""
      }), "review");

      this._oAddReviewDialog = null;

      this.getOwnerComponent()
        .getRouter()
        .getRoute("detail")
        .attachPatternMatched(this._onMatched, this);
    },

    /**
     * Route matched: bind to selected Artist
     * Route pattern expected: artist/{artistID}
     */
    _onMatched: function (oEvent) {
      const raw = oEvent.getParameter("arguments").artistID;
      // Safety: if something weird arrives, clean it
      let s = raw || "";
      try { s = decodeURIComponent(s); } catch (e) {}
      const sCleanID = s
        .split("/")
        .pop()
        .replace(/^Artists\(/, "")
        .replace(/\)$/, "")
        .replace(/['"]/g, "");

      // IMPORTANT: string key => quotes
      const sPath = "/Artists(ID='" + sCleanID + "')";

      this.getView().bindElement({
        path: sPath,
        parameters: {
          "$expand": "reviews,performances($expand=day,stage)"
        },
        events: {
          dataReceived: () => this._recalcRating()
        }
      });
    },

    /**
     * Recalculate average rating based on expanded reviews
     */
    _recalcRating: function () {
      const oCtx = this.getView().getBindingContext();
      const oVM = this.getView().getModel("view");
      if (!oCtx) return;

      const aReviews = oCtx.getProperty("reviews") || [];
      const iCount = aReviews.length;

      const fAvg = iCount
        ? aReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / iCount
        : 0;

      oVM.setProperty("/reviewCount", iCount);
      oVM.setProperty("/avgRating", Math.round(fAvg * 10) / 10); // 1 decimal
    },

    /**
     * Open the "Add Review" dialog
     */
    onOpenAddReview: async function () {
      // reset dialog model
      this.getView().getModel("review").setData({
        customerName: "",
        rating: 0,
        comment: ""
      });

      if (!this._oAddReviewDialog) {
        this._oAddReviewDialog = await Fragment.load({
          id: this.getView().getId(),
          name: "apm.artist.view.fragments.AddReviewDialog",
          controller: this
        });
        this.getView().addDependent(this._oAddReviewDialog);
      }

      this._oAddReviewDialog.open();
    },

    onCancelReview: function () {
      if (this._oAddReviewDialog) {
        this._oAddReviewDialog.close();
      }
    },

    /**
     * Save Review: POST to /Reviews
     * After save -> refresh -> reviews list updates + avg recalculated
     */
    onSaveReview: async function () {
      const oReviewVM = this.getView().getModel("review");
      const oForm = oReviewVM.getData();

      const sName = (oForm.customerName || "").trim();
      const iRating = Number(oForm.rating || 0);
      const sComment = (oForm.comment || "").trim();

      if (!sName) {
        MessageBox.warning("Please enter your name.");
        return;
      }
      if (!iRating || iRating < 1 || iRating > 5) {
        MessageBox.warning("Please select a rating between 1 and 5.");
        return;
      }

      const oCtx = this.getView().getBindingContext();
      if (!oCtx) {
        MessageBox.error("No artist selected.");
        return;
      }

      const sArtistID = oCtx.getProperty("ID");

      // Payload - adjust field names if your Reviews entity differs
      const oPayload = {
        artist_ID: sArtistID,
        rating: iRating,
        comment: sComment,
        reviewDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
        customerName: sName
      };

      try {
        const oModel = this.getView().getModel();

        // Create via OData V4 list binding
        const oListBinding = oModel.bindList("/Reviews");
        const oCreated = oListBinding.create(oPayload);
        await oCreated.created();

        MessageToast.show("Review saved");

        if (this._oAddReviewDialog) {
          this._oAddReviewDialog.close();
        }

        // Force refresh so expanded reviews are re-fetched
        await oModel.refresh();

        // Recalc in case view already has the updated nav data
        this._recalcRating();
      } catch (e) {
        console.error("Create review failed:", e);
        MessageBox.error("Could not save review. Check field names in Reviews and service exposure.");
      }
    },

    /**
     * Back navigation
     */
    onNavBack: function () {
      const sPrev = History.getInstance().getPreviousHash();
      if (sPrev !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("list", {}, true);
      }
    }
  });
});
