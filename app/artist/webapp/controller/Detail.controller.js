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
      // View model for calculated values
      this.getView().setModel(new JSONModel({
        avgRating: 0,
        reviewCount: 0
      }), "view");

      // View model for add-review dialog
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

    _onMatched: function (oEvent) {
      const raw = oEvent.getParameter("arguments").artistID;

      let s = raw || "";
      try { s = decodeURIComponent(s); } catch (e) {}

      // cleanup (in case something weird got passed)
      const sCleanID = s
        .split("/")
        .pop()
        .replace(/^Artists\(/, "")
        .replace(/\)$/, "")
        .replace(/['"]/g, "");

      const sPath = "/Artists(ID='" + sCleanID + "')";

      this.getView().bindElement({
        path: sPath,
        parameters: {
          // IMPORTANT: select extra properties so bindings won't fail in OData V4
          $select: [
            "ID",
            "name",
            "genre",
            "country",
            "bio",
            "popularityScore",
            "spotifyUrl",
            "instagramUrl"
          ].join(","),

          $expand: "reviews,performances($expand=day,stage)"
        },
        events: {
          dataReceived: () => this._recalcRating()
        }
      });
    },

    onOpenSpotify: function () {
      const oCtx = this.getView().getBindingContext();
      const sUrl = oCtx ? oCtx.getProperty("spotifyUrl") : "";

      if (!sUrl) {
        MessageToast.show("No Spotify link configured for this artist.");
        return;
      }
      window.open(sUrl, "_blank");
    },

    onOpenInstagram: function () {
      const oCtx = this.getView().getBindingContext();
      const sUrl = oCtx ? oCtx.getProperty("instagramUrl") : "";

      if (!sUrl) {
        MessageToast.show("No Instagram link configured for this artist.");
        return;
      }
      window.open(sUrl, "_blank");
    },

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
      oVM.setProperty("/avgRating", Math.round(fAvg * 10) / 10);
    },

    onOpenAddReview: async function () {
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

      const oPayload = {
        artist_ID: sArtistID,
        rating: iRating,
        comment: sComment,
        reviewDate: new Date().toISOString().slice(0, 10),
        customerName: sName
      };

      try {
        const oModel = this.getView().getModel();
        const oListBinding = oModel.bindList("/Reviews");

        const oCreated = oListBinding.create(oPayload);
        await oCreated.created();

        MessageToast.show("Review saved");

        if (this._oAddReviewDialog) {
          this._oAddReviewDialog.close();
        }

        await oModel.refresh();
        this._recalcRating();
      } catch (e) {
        console.error("Create review failed:", e);
        MessageBox.error("Could not save review. Check field names in Reviews and service exposure.");
      }
    },

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
