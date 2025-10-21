import { createSlice } from '@reduxjs/toolkit';
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} from './companiesActions';

const initialState = {
  data: [],
  loading: false,
  error: null
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    resetCompaniesState: (state) => {
      state.error = null;
    },
    clearCompanies: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch companies';
      })

      // Create company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.data.push(action.payload);
        state.loading = false;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create company';
      })

      // Update company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        const index = state.data.findIndex(company => company.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update company';
      })

      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.data = state.data.filter(company => company.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete company';
      });
  }
});

export const { resetCompaniesState, clearCompanies } = companiesSlice.actions;
export default companiesSlice.reducer;
