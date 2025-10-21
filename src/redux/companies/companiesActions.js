import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Helper function to get base URL
export const getBaseUrl = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return (
      import.meta.env.VITE_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:8080"
    );
  }
  return "http://localhost:8080";
};

// Fetch all companies
export const fetchCompanies = createAsyncThunk(
  "companies/fetch",
  async (token, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();
      console.log("Fetching companies from:", `${baseUrl}/api/companies`);
      console.log("Using token:", token ? "Token provided" : "No token");

      const response = await axios.get(`${baseUrl}/api/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Companies API response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching companies:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  }
);

// Create a new company
export const createCompany = createAsyncThunk(
  "companies/create",
  async (companyData, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      const { token, ...companyFields } = companyData;

      const response = await axios.post(
        `${baseUrl}/api/companies`,
        companyFields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  }
);

// Update a company
export const updateCompany = createAsyncThunk(
  "companies/update",
  async (companyData, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      const { token, id, ...companyFields } = companyData;

      const response = await axios.put(
        `${baseUrl}/api/companies/${id}`,
        companyFields,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  }
);

// Delete a company
export const deleteCompany = createAsyncThunk(
  "companies/delete",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      await axios.delete(`${baseUrl}/api/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return id;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  }
);
