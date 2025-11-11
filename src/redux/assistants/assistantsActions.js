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

/**
 * Converts an object to FormData
 * @param data Object to convert to FormData
 * @returns FormData instance
 */
const objectToFormData = (data) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "spreadsheet_metadata" && value) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "object" && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

// Fetch all assistants
export const fetchAssistants = createAsyncThunk(
  "assistants/fetch",
  async ({ token, companyId } = {}, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      let url = `${baseUrl}/api/assistants`;
      if (companyId) {
        const query = new URLSearchParams({ company_id: companyId }).toString();
        url = `${url}?${query}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token || "org_test_token"}`,
        },
      });

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  },
);

// Create a new assistant
export const createAssistant = createAsyncThunk(
  "assistants/create",
  async (assistantData, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      const { token, databases, ...assistantFields } = assistantData;
      // Create FormData for the request
      const formData = objectToFormData(assistantFields);

      const response = await axios.post(`${baseUrl}/api/assistants`, formData, {
        headers: {
          Authorization: `Bearer org_test_token`,
          "Content-Type": "multipart/form-data",
        },
      });

      try {
        await axios.post(
          `${baseUrl}/api/assistants/${response.data.id}/tables/group`,
          databases,
          {
            headers: {
              Authorization: `Bearer org_test_token`,
              "Content-Type": "application/json",
            },
          },
        );
      } catch (error) {
        console.error("Error creating database schema:", error);
      }

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  },
);

// Update an assistant
export const updateAssistant = createAsyncThunk(
  "assistants/update",
  async ({ id, data, token }, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      // Prepare the form data to send
      let formDataToSend;

      if (data instanceof FormData) {
        formDataToSend = data;
      } else {
        formDataToSend = objectToFormData(data);
      }

      const response = await axios.put(
        `${baseUrl}/api/assistants/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer org_test_token`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  },
);

// Delete an assistant
export const deleteAssistant = createAsyncThunk(
  "assistants/delete",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const baseUrl = getBaseUrl();

      await axios.delete(`${baseUrl}/api/assistants/${id}`, {
        headers: {
          Authorization: `Bearer org_test_token`,
        },
      });

      // Return the assistant ID that was deleted for state updates
      return id;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";
      return rejectWithValue(message);
    }
  },
);
