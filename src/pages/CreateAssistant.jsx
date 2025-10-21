import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { createAssistant } from "../redux/assistants/assistantsActions";
import {
  selectAssistantsLoading,
  selectAssistantsError,
} from "../redux/assistants/assistantsSelectors";
import { Check, ChevronDown, ChevronUp, ArrowRight, ArrowLeft } from "lucide-react";

const CreateAssistant = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAssistantsLoading);
  const apiError = useSelector(selectAssistantsError);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [assistant, setAssistant] = useState(null);

  const [formData, setFormData] = useState({
    assistant_name: "",
    description: "",
    agent_description: "",
    website_url: "",
    specialization: "general",
    call_preference: "inbound",
    languages: ["English"],
    is_active: true,
    // Additional fields for step 2 and 3
    databases: [],
    services: [],
    phone_number: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const languages = prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang];
      return { ...prev, languages };
    });
  };

  // Step navigation functions
  const goToNextStep = async () => {
    if (currentStep === 2) {
      // Create assistant after step 2 (data integration)
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to get authentication token");
      }

      const assistantData = {
        assistant_name: formData.assistant_name,
        is_active: formData.is_active,
        specialization: formData.specialization,
        call_preference: formData.call_preference,
        language: formData.languages.join(","),
        description: formData.description,
        website_url: formData.website_url || "",
        agent_description: formData.agent_description || "",
          databases: formData.databases || {},
          dataSource: formData.dataSource || "",
          uploadedFile: formData.uploadedFile || null,
        token,
      };

      const resultAction = await dispatch(createAssistant(assistantData));

      if (createAssistant.fulfilled.match(resultAction)) {
          setAssistant(resultAction.payload);
          setCompletedSteps([...completedSteps, currentStep]);
          setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error("Error creating assistant:", error);
    }
    } else if (currentStep < 3) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finalizeAssistant = () => {
    navigate("/assistants");
  };

  const availableLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];

  // Step progress component
  const StepProgress = () => {
    const steps = [
      { number: 1, title: "Basic Information" },
      { number: 2, title: "Data Integration" },
      { number: 3, title: "Configure Services" },
    ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      <div className="flex items-center justify-between relative mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center relative z-10">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep === step.number
                      ? "bg-gray-200 text-gray-900 shadow-lg"
                      : completedSteps.includes(step.number)
                      ? "bg-gray-200 text-gray-900 shadow-lg"
                      : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {completedSteps.includes(step.number) ? (
                    <Check size={20} />
                  ) : (
                    <span className="font-bold text-sm">{step.number}</span>
                  )}
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="ml-4 hidden md:block">
                    <div
                      className={`w-8 h-0.5 transition-all duration-300 ${
                        completedSteps.includes(step.number)
                          ? "bg-gray-300"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
              
              {/* Step Title */}
              <div className="mt-3 text-center">
                <div
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    currentStep === step.number
                      ? "text-gray-900"
                      : completedSteps.includes(step.number)
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  {step.title}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Background Progress Line */}
        <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-200 hidden md:block overflow-hidden">
          <div
            className="h-full bg-gray-300 transition-all duration-500"
            style={{
              width: completedSteps.length > 0 
                ? `${Math.min((completedSteps.length / (steps.length - 1)) * 100, 100)}%` 
                : '0%'
            }}
          />
        </div>
      </div>
      
      {/* Step Content */}
      <div className="border-t border-gray-200 pt-8">
        {/* Step 1: Basic Information */}
        <Step1BasicInfo 
          currentStep={currentStep}
          formData={formData}
          setFormData={setFormData}
          goToNextStep={goToNextStep}
          availableLanguages={availableLanguages}
        />

        {/* Step 2: Data Integration */}
        <Step2DataIntegration 
          currentStep={currentStep}
          formData={formData}
          setFormData={setFormData}
          goToNextStep={goToNextStep}
          goToPreviousStep={goToPreviousStep}
        />

        {/* Step 3: Configure Services */}
        <Step3ConfigureServices 
          currentStep={currentStep}
          formData={formData}
          setFormData={setFormData}
          finalizeAssistant={finalizeAssistant}
          goToPreviousStep={goToPreviousStep}
          assistant={assistant}
        />
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-700">Creating assistant...</p>
          </div>
        </div>
      )}

        {/* API Error Message */}
        {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start mb-6">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{apiError}</p>
            </div>
          </div>
        )}

      {/* Main content */}
      <div className="w-full p-6">
        {/* Step Progress with integrated content */}
        <StepProgress />
      </div>
    </div>
  );
};

// Step 1: Basic Information Component
const Step1BasicInfo = ({ currentStep, formData, setFormData, goToNextStep, availableLanguages }) => {
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);

  if (currentStep !== 1) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData((prev) => {
      const languages = prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang];
      return { ...prev, languages };
    });
  };

  return (
    <div className="mb-8">
      <form onSubmit={(e) => { e.preventDefault(); goToNextStep(); }} className="space-y-6">
        {/* Assistant Name - Full Width */}
            <div>
          <label htmlFor="assistant_name" className="block text-sm font-medium text-gray-700 mb-2">
                Assistant Name *
              </label>
              <input
                type="text"
                id="assistant_name"
                name="assistant_name"
                value={formData.assistant_name}
                onChange={handleChange}
                required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                placeholder="e.g., Customer Support Bot"
              />
            </div>

        {/* Description - Full Width */}
            <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                placeholder="Brief description of the assistant's purpose"
              />
            </div>

        {/* Website URL and Languages - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supported Languages *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500 text-left flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {formData.languages.length > 0 
                    ? formData.languages.join(", ") 
                    : "Select languages"
                  }
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${languageDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {languageDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableLanguages.map((lang) => (
                    <label key={lang} className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang)}
                        onChange={() => handleLanguageToggle(lang)}
                        className="h-4 w-4 text-purple-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">{lang}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specialization and Call Preference - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
              >
                <option value="general">General</option>
                <option value="customer_support">Customer Support</option>
                <option value="sales">Sales</option>
                <option value="technical">Technical Support</option>
                <option value="scheduling">Scheduling</option>
              </select>
            </div>

            <div>
            <label htmlFor="call_preference" className="block text-sm font-medium text-gray-700 mb-2">
                Call Preference
              </label>
              <select
                id="call_preference"
                name="call_preference"
                value={formData.call_preference}
                onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
              >
                <option value="inbound">Inbound Only</option>
                <option value="outbound">Outbound Only</option>
                <option value="both">Both Inbound & Outbound</option>
              </select>
            </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Step 2: Data Integration Component
const Step2DataIntegration = ({ currentStep, formData, setFormData, goToNextStep, goToPreviousStep }) => {
  const [activeDatabase, setActiveDatabase] = useState(null);
  const [isAddingDatabase, setIsAddingDatabase] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumn, setNewColumn] = useState({
    name: "",
    display_name: "",
    type: "string",
    required: false,
    is_primary_key: false,
  });
  const [newDatabase, setNewDatabase] = useState({
    display_name: "",
    description: "",
    columns: []
  });

  if (currentStep !== 2) return null;

  // Initialize databases array if it doesn't exist
  const databases = formData.databases || [];

  const handleAddNewDatabase = () => {
    setActiveDatabase(null);
    setNewDatabase({
      display_name: "",
      description: "",
      columns: []
    });
    setIsAddingDatabase(true);
  };

  const handleSaveDatabase = () => {
    if (!newDatabase.display_name.trim()) {
      alert("Please enter a database name");
      return;
    }

    const databaseData = {
      ...newDatabase,
      name: newDatabase.display_name.toLowerCase().replace(/\s+/g, "_"),
      columns: newDatabase.columns
    };

    setFormData(prev => ({
      ...prev,
      databases: [...prev.databases, databaseData]
    }));

    setNewDatabase({
      display_name: "",
      description: "",
      columns: []
    });
    setIsAddingDatabase(false);
  };

  const handleAddColumn = () => {
    if (!newColumn.name.trim() || !newColumn.display_name.trim()) {
      alert("Please fill in column name and display name");
      return;
    }

    const columnData = {
      ...newColumn,
      name: newColumn.name.toLowerCase().replace(/\s+/g, "_")
    };

    setNewDatabase(prev => ({
      ...prev,
      columns: [...prev.columns, columnData]
    }));

    setNewColumn({
      name: "",
      display_name: "",
      type: "string",
      required: false,
      is_primary_key: false,
    });
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = (index) => {
    setNewDatabase(prev => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index)
    }));
  };

  const handleDeleteDatabase = (index) => {
    setFormData(prev => ({
      ...prev,
      databases: prev.databases.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="mb-8">
      <div className="space-y-6">
        {/* Add Database Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Databases</h3>
          <button
            onClick={handleAddNewDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Database
          </button>
        </div>

        {/* Existing Databases */}
        {databases.map((db, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{db.display_name}</h4>
                  <p className="text-sm text-gray-600">{db.description || "No description"}</p>
                  <p className="text-xs text-gray-500">{db.columns.length} columns</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDatabase(index)}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Add New Database Form */}
        {isAddingDatabase && (
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Database</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
                <input
                  type="text"
                  value={newDatabase.display_name}
                  onChange={(e) => setNewDatabase(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                  placeholder="e.g., Customer Database"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newDatabase.description}
                  onChange={(e) => setNewDatabase(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                  rows={3}
                  placeholder="Describe what this database contains"
                />
            </div>

              {/* Columns Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Columns</h5>
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Column
                  </button>
                </div>

                {/* Existing Columns */}
                {newDatabase.columns.map((column, colIndex) => (
                  <div key={colIndex} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 mb-2">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{column.display_name}</span>
                      <span className="text-sm text-gray-500 ml-2">({column.type})</span>
                      {column.required && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded ml-2">Required</span>}
                      {column.is_primary_key && <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded ml-2">Primary Key</span>}
                    </div>
                    <button
                      onClick={() => handleDeleteColumn(colIndex)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add Column Form */}
                {isAddingColumn && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h6 className="font-medium text-gray-900 mb-3">Add Column</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Column Name</label>
                        <input
                          type="text"
                          value={newColumn.name}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                          placeholder="column_name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                        <input
                          type="text"
                          value={newColumn.display_name}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, display_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                          placeholder="Column Display Name"
                        />
              </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={newColumn.type}
                          onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="date">Date</option>
                        </select>
            </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newColumn.required}
                            onChange={(e) => setNewColumn(prev => ({ ...prev, required: e.target.checked }))}
                            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                        <label className="flex items-center gap-2">
              <input
                type="checkbox"
                            checked={newColumn.is_primary_key}
                            onChange={(e) => setNewColumn(prev => ({ ...prev, is_primary_key: e.target.checked }))}
                            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700">Primary Key</span>
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleAddColumn}
                        className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Add Column
                      </button>
                      <button
                        onClick={() => setIsAddingColumn(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveDatabase}
                className="px-6 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Save Database
              </button>
              <button
                onClick={() => setIsAddingDatabase(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={goToNextStep}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Create Assistant
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 3: Configure Services Component
const Step3ConfigureServices = ({ currentStep, formData, setFormData, finalizeAssistant, goToPreviousStep, assistant }) => {
  if (currentStep !== 3) return null;

  return (
    <div className="mb-8">
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assistant Created Successfully!</h3>
          <p className="text-gray-600 mb-6">Your assistant "{assistant?.assistant_name}" is ready to use</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Configure phone numbers for your assistant</li>
              <li>• Set up integrations with your existing systems</li>
              <li>• Test your assistant with sample conversations</li>
              <li>• Monitor performance and analytics</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={finalizeAssistant}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Complete Setup
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssistant;

