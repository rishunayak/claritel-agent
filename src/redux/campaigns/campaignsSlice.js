import { createSlice } from "@reduxjs/toolkit";
import { startCampaign } from "./campaignsActions";

const initialState = {
  loading: false,
  error: null,
  success: false,
  lastCampaign: null,
};

const campaignsSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    resetCampaignState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.lastCampaign = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(startCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastCampaign = action.payload;
      })
      .addCase(startCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Something went wrong while starting the campaign";
        state.success = false;
      });
  },
});

export const { resetCampaignState } = campaignsSlice.actions;
export default campaignsSlice.reducer;


