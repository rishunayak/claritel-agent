import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
const selectCompaniesState = (state) => state.companies;

// Derived selectors
export const selectAllCompanies = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.data
);

export const selectCompaniesLoading = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.loading
);

export const selectCompaniesError = createSelector(
  [selectCompaniesState],
  (companiesState) => companiesState.error
);

export const selectCompanyById = createSelector(
  [selectAllCompanies, (state, companyId) => companyId],
  (companies, companyId) => companies.find(company => company.id === companyId)
);
