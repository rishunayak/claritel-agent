import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getBaseUrl } from "../companies/companiesActions";

export const startCampaign = createAsyncThunk(
  "campaigns/start",
  async (campaignData, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();
      const { token, ...payload } = campaignData;

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer org_test_token`;
      }

      const response = await axios.post(
        `${baseUrl}/api/bulk-call`,
        payload,
        { headers },
      );

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to start campaign";
      return rejectWithValue(message);
    }
  },
);


