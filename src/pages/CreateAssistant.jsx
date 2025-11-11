import { useState, useEffect, useCallback, memo } from "react";
import {
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { createAssistant } from "../redux/assistants/assistantsActions";
import {
  selectAssistantsLoading,
  selectAssistantsError,
} from "../redux/assistants/assistantsSelectors";
import { fetchCompanies } from "../redux/companies/companiesActions";
import {
  selectAllCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
} from "../redux/companies/companiesSelectors";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

const CreateAssistant = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { companyId: companyIdParam } = useParams();
  const location = useLocation();

  const isLoading = useSelector(selectAssistantsLoading);
  const apiError = useSelector(selectAssistantsError);

  // Companies state
  const companies = useSelector(selectAllCompanies);
  const companiesLoading = useSelector(selectCompaniesLoading);
  const companiesError = useSelector(selectCompaniesError);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [assistant, setAssistant] = useState(null);

  const [formData, setFormData] = useState({
    assistant_name: "",
    agent_description: "",
    website_url: "",
    specialization: "support",
    call_preference: "inbound",
    language: "en",
    is_active: true,
    company_id: "",
    // Additional fields for step 2 and 3
    databases: [],
    services: [],
    phone_number: "",
  });

  const companyNameFromState = location.state?.companyName;
  const queryCompanyParam = searchParams.get("company");
  const initialPreselectedCompanyId =
    companyIdParam ||
    (queryCompanyParam ? queryCompanyParam.replace(/"/g, "") : "");
  const [preselectedCompanyId, setPreselectedCompanyId] = useState(
    initialPreselectedCompanyId || "",
  );
  const companyLocked = Boolean(companyIdParam);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        const token = await getToken();
        if (token) {
          dispatch(fetchCompanies(token));
        }
      } catch (error) {
        console.error("Error getting token for companies fetch:", error);
      }
    };

    fetchCompaniesData();
  }, [dispatch, getToken]);

  // Handle URL query parameter for company selection
  useEffect(() => {
    const queryParam = searchParams.get("company");
    const normalized =
      companyIdParam || (queryParam ? queryParam.replace(/"/g, "") : "");

    setPreselectedCompanyId((prev) =>
      prev === (normalized || "") ? prev : normalized || "",
    );
  }, [companyIdParam, searchParams]);

  useEffect(() => {
    if (!preselectedCompanyId) return;

    setFormData((prev) => {
      if (companyLocked) {
        if (prev.company_id === preselectedCompanyId) return prev;
        return {
          ...prev,
          company_id: preselectedCompanyId,
        };
      }

      if (!prev.company_id) {
        return {
          ...prev,
          company_id: preselectedCompanyId,
        };
      }

      return prev;
    });
  }, [preselectedCompanyId, companyLocked]);

  useEffect(() => {
    if (!preselectedCompanyId || companies.length === 0) return;

    const matchedCompany = companies.find(
      (company) => company.id === preselectedCompanyId,
    );

    if (!matchedCompany) return;

    setFormData((prev) => {
      if (
        prev.company_name === matchedCompany.name &&
        prev.company_id === preselectedCompanyId
      ) {
        return prev;
      }

      if (
        companyLocked ||
        !prev.company_id ||
        prev.company_id === preselectedCompanyId
      ) {
        return {
          ...prev,
          company_id: preselectedCompanyId,
          company_name: matchedCompany.name,
        };
      }

      return prev;
    });
  }, [preselectedCompanyId, companies, companyLocked]);

  useEffect(() => {
    if (!companyLocked || !companyNameFromState) return;

    setFormData((prev) => {
      if (prev.company_name === companyNameFromState) {
        return prev;
      }

      return {
        ...prev,
        company_name: companyNameFromState,
      };
    });
  }, [companyLocked, companyNameFromState]);

  // Step navigation functions
  const goToNextStep = useCallback(async () => {
    if (currentStep === 2) {
      // Create assistant after step 2 (data integration)
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Failed to get authentication token");
        }

        const assistantData = {
          assistant_name: formData.assistant_name,
          call_preference: formData.call_preference,
          specialization: formData.specialization,
          is_active: formData.is_active,
          website_url: formData.website_url || "",
          language: formData.language,
          agent_description: formData.agent_description || "",
          company_id: formData.company_id,
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
  }, [currentStep, completedSteps, formData, getToken, dispatch]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const finalizeAssistant = useCallback(() => {
    if (companyIdParam) {
      navigate(`/companies/${companyIdParam}/assistants`);
    } else {
      navigate("/assistants");
    }
  }, [navigate, companyIdParam]);

  const availableLanguages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
            <p className="text-gray-700">Creating assistant...</p>
          </div>
        </div>
      )}

      {/* API Error Message */}
      {apiError && (
        <div className="mb-6 flex items-start rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="mr-3 text-red-600">⚠️</div>
          <div>
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="w-full p-6">
        {companyLocked && (
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(`/companies/${companyIdParam}/assistants`)
              }
              className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#E6E6FF] px-3 py-2 text-sm font-medium text-indigo-700 transition hover:border-[#CBCBFF] hover:bg-[#d9d9ff]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        )}
        {/* Step Progress with integrated content */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="relative mb-8 flex items-center justify-between">
            {[
              { number: 1, title: "Basic Information" },
              { number: 2, title: "Data Integration" },
              { number: 3, title: "Configure Services" },
            ].map((step, index) => (
              <div
                key={step.number}
                className="relative z-10 flex items-center"
              >
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    {/* Step Circle */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                        currentStep === step.number
                          ? "bg-gray-200 text-gray-900 shadow-lg"
                          : completedSteps.includes(step.number)
                            ? "bg-gray-200 text-gray-900 shadow-lg"
                            : "border-2 border-gray-200 bg-gray-100 text-gray-400"
                      }`}
                    >
                      {completedSteps.includes(step.number) ? (
                        <Check size={20} />
                      ) : (
                        <span className="text-sm font-bold">{step.number}</span>
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < 2 && (
                      <div className="ml-4 hidden md:block">
                        <div
                          className={`h-0.5 w-8 transition-all duration-300 ${
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
            <div className="absolute top-6 right-12 left-12 hidden h-0.5 overflow-hidden bg-gray-200 md:block">
              <div
                className="h-full bg-gray-300 transition-all duration-500"
                style={{
                  width:
                    completedSteps.length > 0
                      ? `${Math.min((completedSteps.length / 2) * 100, 100)}%`
                      : "0%",
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
              companies={companies}
              companiesLoading={companiesLoading}
              companiesError={companiesError}
              companyLocked={companyLocked}
              preselectedCompanyId={preselectedCompanyId}
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
      </div>
    </div>
  );
};

// Step 1: Basic Information Component
const Step1BasicInfo = ({
  currentStep,
  formData,
  setFormData,
  goToNextStep,
  companies,
  companiesLoading,
  companiesError,
  companyLocked,
  preselectedCompanyId,
}) => {
  if (currentStep !== 1) return null;

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const isPreselected = Boolean(preselectedCompanyId);

  useEffect(() => {
    if (companyLocked) {
      setCompanyDropdownOpen(false);
    }
  }, [companyLocked]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (companyLocked) return undefined;

    const handleClickOutside = (event) => {
      if (!event.target.closest(".company-dropdown")) {
        setCompanyDropdownOpen(false);
      }
    };

    if (companyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [companyDropdownOpen, companyLocked]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleCompanySelect = useCallback((companyId, companyName) => {
    setFormData((prev) => ({
      ...prev,
      company_id: companyId,
      company_name: companyName,
    }));
    setCompanyDropdownOpen(false);
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!formData.company_id) {
        alert("Please select a company to continue");
        return;
      }
      goToNextStep();
    },
    [formData.company_id, goToNextStep],
  );

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assistant Name and Company - Side by Side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Assistant Name */}
          <div>
            <label
              htmlFor="assistant_name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Assistant Name *
            </label>
            <input
              type="text"
              id="assistant_name"
              name="assistant_name"
              value={formData.assistant_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
              placeholder="e.g., Customer Support Bot"
            />
          </div>

          {/* Company Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Company *
            </label>
            <div className="company-dropdown relative">
              <button
                type="button"
                onClick={() =>
                  !companyLocked && setCompanyDropdownOpen(!companyDropdownOpen)
                }
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left focus:ring-0 ${
                  companyLocked
                    ? "cursor-default border-gray-200 bg-gray-50 text-gray-700"
                    : "border-gray-300 focus:border-gray-500"
                }`}
                disabled={companiesLoading || companyLocked}
              >
                <span className="text-gray-700">
                  {formData.company_name ||
                    (companyLocked
                      ? formData.company_id || "Selected company"
                      : "Select a company")}
                </span>
                <div className="flex items-center gap-2">
                  {companyLocked && formData.company_id && (
                    <span className="rounded-full bg-[#E6E6FF] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-600 uppercase">
                      Locked
                    </span>
                  )}
                  {!companyLocked && isPreselected && formData.company_id && (
                    <span className="rounded-full bg-[#E6E6FF] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-600 uppercase">
                      Pre-selected
                    </span>
                  )}
                  {!companyLocked && (
                    <svg
                      className={`h-5 w-5 text-gray-400 transition-transform ${companyDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </button>

              {!companyLocked && companyDropdownOpen && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                  {companiesLoading ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      Loading companies...
                    </div>
                  ) : companiesError ? (
                    <div className="px-4 py-3 text-center text-red-500">
                      Error loading companies: {companiesError}
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500">
                      No companies available
                    </div>
                  ) : (
                    companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() =>
                          handleCompanySelect(company.id, company.name)
                        }
                        className="w-full cursor-pointer border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">
                          {company.name}
                        </span>
                        {company.description && (
                          <p className="mt-1 text-xs text-gray-500">
                            {company.description}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agent Description - Full Width */}
        <div>
          <label
            htmlFor="agent_description"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Agent Description
          </label>
          <textarea
            id="agent_description"
            name="agent_description"
            value={formData.agent_description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
            placeholder="Agent offers support"
          />
        </div>

        {/* Website URL and Language - Side by Side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="website_url"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
        </div>

        {/* Specialization and Call Preference - Side by Side */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="specialization"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Specialization
            </label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
            >
              <option value="support">Support</option>
              <option value="general">General</option>
              <option value="customer_support">Customer Support</option>
              <option value="sales">Sales</option>
              <option value="technical">Technical Support</option>
              <option value="scheduling">Scheduling</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="call_preference"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Call Preference
            </label>
            <select
              id="call_preference"
              name="call_preference"
              value={formData.call_preference}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
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
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-8 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300"
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

Step1BasicInfo.displayName = "Step1BasicInfo";

// Step 2: Data Integration Component
const Step2DataIntegration = ({
  currentStep,
  formData,
  setFormData,
  goToNextStep,
  goToPreviousStep,
}) => {
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
    columns: [],
  });

  if (currentStep !== 2) return null;

  // Initialize databases array if it doesn't exist
  const databases = formData.databases || [];

  const handleAddNewDatabase = () => {
    setActiveDatabase(null);
    setNewDatabase({
      display_name: "",
      description: "",
      columns: [],
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
      columns: newDatabase.columns,
    };

    setFormData((prev) => ({
      ...prev,
      databases: [...prev.databases, databaseData],
    }));

    setNewDatabase({
      display_name: "",
      description: "",
      columns: [],
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
      name: newColumn.name.toLowerCase().replace(/\s+/g, "_"),
    };

    setNewDatabase((prev) => ({
      ...prev,
      columns: [...prev.columns, columnData],
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
    setNewDatabase((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteDatabase = (index) => {
    setFormData((prev) => ({
      ...prev,
      databases: prev.databases.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="mb-8">
      <div className="space-y-6">
        {/* Add Database Button */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Your Databases</h3>
          <button
            onClick={handleAddNewDatabase}
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Database
          </button>
        </div>

        {/* Existing Databases */}
        {databases.map((db, index) => (
          <div key={index} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {db.display_name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {db.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {db.columns.length} columns
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDatabase(index)}
                className="rounded-lg p-2 text-purple-600 transition-colors hover:bg-purple-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Add New Database Form */}
        {isAddingDatabase && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h4 className="mb-4 text-lg font-medium text-gray-900">
              Add New Database
            </h4>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Database Name
                </label>
                <input
                  type="text"
                  value={newDatabase.display_name}
                  onChange={(e) =>
                    setNewDatabase((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                  placeholder="e.g., Customer Database"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newDatabase.description}
                  onChange={(e) =>
                    setNewDatabase((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                  rows={3}
                  placeholder="Describe what this database contains"
                />
              </div>

              {/* Columns Section */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">Columns</h5>
                  <button
                    onClick={() => setIsAddingColumn(true)}
                    className="flex items-center gap-2 rounded-lg bg-gray-200 px-3 py-1 text-sm text-gray-900 transition-colors hover:bg-gray-300"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Column
                  </button>
                </div>

                {/* Existing Columns */}
                {newDatabase.columns.map((column, colIndex) => (
                  <div
                    key={colIndex}
                    className="mb-2 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                  >
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">
                        {column.display_name}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({column.type})
                      </span>
                      {column.required && (
                        <span className="ml-2 rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
                          Required
                        </span>
                      )}
                      {column.is_primary_key && (
                        <span className="ml-2 rounded bg-indigo-100 px-2 py-1 text-xs text-indigo-800">
                          Primary Key
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteColumn(colIndex)}
                      className="rounded p-1 text-purple-600 hover:bg-purple-50"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add Column Form */}
                {isAddingColumn && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h6 className="mb-3 font-medium text-gray-900">
                      Add Column
                    </h6>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Column Name
                        </label>
                        <input
                          type="text"
                          value={newColumn.name}
                          onChange={(e) =>
                            setNewColumn((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                          placeholder="column_name"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={newColumn.display_name}
                          onChange={(e) =>
                            setNewColumn((prev) => ({
                              ...prev,
                              display_name: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
                          placeholder="Column Display Name"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          value={newColumn.type}
                          onChange={(e) =>
                            setNewColumn((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:ring-0"
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
                            onChange={(e) =>
                              setNewColumn((prev) => ({
                                ...prev,
                                required: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700">
                            Required
                          </span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newColumn.is_primary_key}
                            onChange={(e) =>
                              setNewColumn((prev) => ({
                                ...prev,
                                is_primary_key: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700">
                            Primary Key
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={handleAddColumn}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300"
                      >
                        Add Column
                      </button>
                      <button
                        onClick={() => setIsAddingColumn(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveDatabase}
                className="rounded-lg bg-gray-200 px-6 py-2 text-gray-900 transition-colors hover:bg-gray-300"
              >
                Save Database
              </button>
              <button
                onClick={() => setIsAddingDatabase(false)}
                className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
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
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={goToNextStep}
            className="flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-300"
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
const Step3ConfigureServices = ({
  currentStep,
  formData,
  setFormData,
  finalizeAssistant,
  goToPreviousStep,
  assistant,
}) => {
  if (currentStep !== 3) return null;

  return (
    <div className="mb-8">
      <div className="space-y-6">
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Assistant Created Successfully!
          </h3>
          <p className="mb-6 text-gray-600">
            Your assistant "{assistant?.assistant_name}" is ready to use
          </p>

          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-medium text-gray-900">Next Steps:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
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
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={finalizeAssistant}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
          >
            Complete Setup
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssistant;
