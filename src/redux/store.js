import { configureStore } from '@reduxjs/toolkit';
import assistantsReducer from './assistants/assistantsSlice';
import companiesReducer from './companies/companiesSlice';
import campaignsReducer from './campaigns/campaignsSlice';

export const store = configureStore({
  reducer: {
    assistants: assistantsReducer,
    companies: companiesReducer,
    campaigns: campaignsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['assistants/create/fulfilled', 'assistants/update/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.externalDocuments'],
        // Ignore these paths in the state
        ignoredPaths: ['assistants.data.externalDocuments'],
      },
    }),
});

export default store;

