import { createSelector } from '@reduxjs/toolkit';

// Basic selectors
const selectAssistantsState = (state) => state.assistants;

// Derived selectors
export const selectAllAssistants = createSelector(
  [selectAssistantsState],
  (assistantsState) => assistantsState.data
);

export const selectAssistantsLoading = createSelector(
  [selectAssistantsState],
  (assistantsState) => assistantsState.loading
);

export const selectAssistantsError = createSelector(
  [selectAssistantsState],
  (assistantsState) => assistantsState.error
);

// Select assistant by ID
export const selectAssistantById = (id) => createSelector(
  [selectAllAssistants],
  (assistants) => assistants.find(assistant => assistant.id === id) || null
);

// Count active and inactive assistants
export const selectAssistantStats = createSelector(
  [selectAllAssistants],
  (assistants) => {
    const total = assistants.length;
    const active = assistants.filter(assistant => assistant.is_active).length;
    const inactive = total - active;

    return {
      total,
      active,
      inactive
    };
  }
);

