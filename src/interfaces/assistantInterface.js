// Assistant Interface
export const AssistantInterface = {
  id: "",
  orgId: "",
  assistant_name: "",
  website_url: "",
  language: "",
  description: "",
  agent_description: "",
  call_preference: "",
  specialization: "",
  created_at: "",
  updated_at: "",
  is_active: false,
  default_phone: null,
  externalDocuments: [],
  spreadsheet_metadata: null,
  plivo_number: ""
};

// Form Data Interface
export const FormDataInterface = {
  assistant_name: "",
  agent_description: "",
  languages: [],
  website_url: "",
  description: "",
  spreadsheet_url: "",
  spreadsheetConnected: false,
  generatedPhone: "",
  phoneGenerated: false,
  specialization: "",
  spreadsheet_metadata: { id: "", name: "", url: "" },
  call_preference: "",
  services: [],
  newSheetName: "",
  database: null,
  databases: [],
  file: null
};

// Create Assistant Params
export const CreateAssistantParams = {
  token: "",
  assistant_name: "",
  is_active: false,
  specialization: "",
  call_preference: "",
  spreadsheet_metadata: null,
  language: "",
  description: "",
  website_url: "",
  databases: {},
  agent_description: ""
};

// Update Assistant Params
export const UpdateAssistantParams = {
  id: "",
  data: {},
  token: ""
};

// Delete Assistant Params
export const DeleteAssistantParams = {
  id: "",
  token: ""
};

// Assistants State
export const AssistantsState = {
  data: [],
  loading: false,
  error: null
};

