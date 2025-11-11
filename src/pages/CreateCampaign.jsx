import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import {
  Phone,
  Upload,
  Sparkles,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Download,
  MessageCircle,
  Edit2,
  Trash2,
  Save,
} from "lucide-react";
import { fetchAssistants } from "../redux/assistants/assistantsActions";
import {
  selectAllAssistants,
  selectAssistantsLoading,
  selectAssistantsError,
} from "../redux/assistants/assistantsSelectors";
import { startCampaign } from "../redux/campaigns/campaignsActions";
import {
  selectCampaignLoading,
  selectCampaignError,
} from "../redux/campaigns/campaignsSelectors";
import { resetCampaignState } from "../redux/campaigns/campaignsSlice";

const downloadSampleCsv = () => {
  const csvContent = `phone,gender,name,date,product_name,service_number
+919696989898,Male,Vaibhav,3/15/2023,Product,123456
9876543210,Male,Rishu Kumar Nayak,3/16/2023,Service,123457
+91 9876543211,Male,Sumit,3/17/2023,Product,123458`;

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample_contacts.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const getStoredMessageTemplate = () => {
  try {
    const stored = localStorage.getItem("initialMessageTemplate");
    return stored || "Hello {name}, this is an automated call...";
  } catch (error) {
    console.log("localStorage not available, using default template");
    return "Hello {name}, this is an automated call...";
  }
};

const saveMessageTemplate = (template) => {
  try {
    localStorage.setItem("initialMessageTemplate", template);
  } catch (error) {
    console.log("localStorage not available, template not saved");
  }
};

const normalizeFieldName = (fieldName) =>
  fieldName.toLowerCase().replace(/\s+/g, "_").trim();

const parseCsvHeaders = (content) => {
  const lines = content.trim().split("\n");
  if (lines.length < 1) {
    throw new Error("CSV file is empty.");
  }

  return lines[0]
    .split(",")
    .map((h) => normalizeFieldName(h.trim().replace(/"/g, "")));
};

const parseCsvContent = (content) => {
  const lines = content.trim().split("\n");

  if (lines.length < 1) {
    return [];
  }

  const headers = lines[0]
    .split(",")
    .map((h) => normalizeFieldName(h.trim().replace(/"/g, "")));

  const allData = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const rowData = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index] || "";
    });
    allData.push(rowData);
  }

  return allData;
};

const InlineOutboundCsvUpload = ({
  formData,
  onInputChange,
  onAssistantChange,
  assistants,
  assistantsLoading,
  assistantsError,
  selectedAssistant,
  authToken,
  isCampaignReady,
}) => {
  const dispatch = useDispatch();
  const isSubmitting = useSelector(selectCampaignLoading);
  const campaignError = useSelector(selectCampaignError);

  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRowData, setCsvRowData] = useState([]);
  const [isProcessing, setCsvProcessing] = useState(false);
  const [previewLimit, setPreviewLimit] = useState(10);
  const [editingIndex, setEditingIndex] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const fileInputRef = useRef(null);

  const [callSettings, setCallSettings] = useState({
    initialMessageTemplate: getStoredMessageTemplate(),
    callDelaySeconds: 5,
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    if (campaignError) {
      setFeedback({
        type: "error",
        message: campaignError,
      });
    }
  }, [campaignError]);

  useEffect(() => {
    return () => {
      dispatch(resetCampaignState());
    };
  }, [dispatch]);

  const assistantPhoneNumber =
    selectedAssistant?.plivo_number || selectedAssistant?.default_phone || "";
  const assistantDisplayPhone = assistantPhoneNumber || "Not available";

  const handleShowMore = () => {
    setPreviewLimit((prev) => prev + 10);
  };

  const handleSettingsChange = (field, value) => {
    setCallSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "initialMessageTemplate" && typeof value === "string") {
      saveMessageTemplate(value);
    }
  };

  const handleEditContact = (index, field, value) => {
    setCsvRowData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveEdit = (index) => {
    setEditingIndex(null);
    setFeedback({
      type: "success",
      message: "Contact updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleDeleteContact = (index) => {
    setCsvRowData((prev) => prev.filter((_, i) => i !== index));
    setFeedback({
      type: "success",
      message: "Contact deleted successfully.",
    });
  };

  const quickValidateFile = async () => true;

  const handleFileSelect = async (event) => {
    if (!isCampaignReady) {
      setFeedback({
        type: "error",
        message:
          "Complete the campaign details above before uploading a CSV file.",
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFeedback({
        type: "error",
        message: "Please select a CSV file.",
      });
      return;
    }

    try {
      await quickValidateFile(file);
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Invalid CSV file.",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setCsvHeaders([]);
    setCsvRowData([]);
    setPreviewLimit(10);
    setCsvFile(file);
    setCsvProcessing(true);

    try {
      const content = await file.text();
      const headers = parseCsvHeaders(content);
      setCsvHeaders(headers);

      const allData = parseCsvContent(content);
      setCsvRowData(allData);
      setPreviewLimit(10);
      setFeedback({
        type: "success",
        message: `Successfully processed ${allData.length} records from CSV.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to parse CSV file.",
      });
      setCsvHeaders([]);
      setCsvRowData([]);
      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setCsvProcessing(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (!isCampaignReady) {
      setFeedback({
        type: "error",
        message:
          "Complete the campaign details above before uploading a CSV file.",
      });
      return;
    }

    const file = event.dataTransfer.files[0];

    if (file && file.name.toLowerCase().endsWith(".csv")) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const syntheticEvent = {
        target: {
          files: dataTransfer.files,
        },
      };

      handleFileSelect(syntheticEvent);
    } else {
      setFeedback({
        type: "error",
        message: "Please drop a CSV file.",
      });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const resetForm = () => {
    setCsvFile(null);
    setCsvHeaders([]);
    setCsvRowData([]);
    setPreviewLimit(10);
    setEditingIndex(null);
    setCallSettings({
      initialMessageTemplate: getStoredMessageTemplate(),
      callDelaySeconds: 5,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBulkCall = async () => {
    if (!isCampaignReady) {
      setFeedback({
        type: "error",
        message: "Complete the campaign details above before starting calls.",
      });
      return;
    }

    if (csvRowData.length === 0) {
      setFeedback({
        type: "error",
        message: "Please upload and process a CSV file first.",
      });
      return;
    }

    if (!formData.assistantId) {
      setFeedback({
        type: "error",
        message: "Select an assistant before starting calls.",
      });
      return;
    }

    if (!authToken) {
      setFeedback({
        type: "error",
        message:
          "Authentication token not available. Please refresh and try again.",
      });
      return;
    }

    try {
      const toIsoOrNull = (value) => {
        if (!value) return null;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      };

      const requestBody = {
        campaign_name: formData.campaignName.trim(),
        description: formData.description.trim(),
        assistant_id: formData.assistantId,
        execution_mode: formData.executionMode,
        candidates: csvRowData,
        call_settings: {
          call_delay_seconds: callSettings.callDelaySeconds,
          start_time: toIsoOrNull(callSettings.startTime),
          end_time: toIsoOrNull(callSettings.endTime),
        },
      };

      if (callSettings.initialMessageTemplate.trim()) {
        requestBody.initial_message_template =
          callSettings.initialMessageTemplate.trim();
      }

      await dispatch(
        startCampaign({
          ...requestBody,
          token: authToken,
        }),
      ).unwrap();

      setFeedback({
        type: "success",
        message: `${
          csvRowData.length === 1 ? "Call" : "Bulk calls"
        } initiated successfully.`,
      });

      resetForm();
      dispatch(resetCampaignState());
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          typeof error === "string"
            ? error
            : error?.message || "Failed to initiate campaign.",
      });
    }
  };

  const handleSubmit = async () => {
    await handleBulkCall();
  };

  return (
    <section
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      id="bulk-outbound-calls"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Create Campaign
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Provide the campaign details, upload your CSV contacts, and launch
            outbound calls.
          </p>
        </div>
        <button
          onClick={downloadSampleCsv}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Download Sample CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Campaign Name *
          </label>
          <input
            type="text"
            name="campaignName"
            value={formData.campaignName}
            onChange={onInputChange}
            placeholder="e.g., Q1 Product Outreach"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Execution Mode
          </label>
          <select
            name="executionMode"
            value={formData.executionMode}
            onChange={onInputChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="sequential">Sequential</option>
            <option value="parallel">Parallel</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Campaign Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={4}
          placeholder="Describe the purpose of this campaign"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Assistant *
        </label>
        <div className="relative">
          <select
            value={formData.assistantId}
            onChange={onAssistantChange}
            disabled={assistantsLoading}
            className="w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select an assistant</option>
            {assistants.map((assistant) => (
              <option key={assistant.id} value={assistant.id}>
                {assistant.assistant_name || assistant.id}
              </option>
            ))}
          </select>
          <Phone className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        {assistantsLoading && (
          <p className="mt-2 text-sm text-gray-500">Loading assistants...</p>
        )}
        {assistantsError && (
          <p className="mt-2 text-sm text-red-600">{assistantsError}</p>
        )}
      </div>

      {!isCampaignReady && (
        <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
          Complete the campaign details above to enable CSV uploads and outbound
          call initiation.
        </div>
      )}

      {feedback && (
        <div
          className={`rounded-md border p-3 text-sm ${
            feedback.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-6 h-full">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload CSV File
            </label>

            <div
              className={`flex h-[85%] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isCampaignReady
                  ? "border-gray-300 hover:border-gray-400"
                  : "border-gray-200 bg-gray-50"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing || !isCampaignReady}
              />

              {csvFile ? (
                <div className="flex h-full items-center justify-center">
                  <FileText className="mr-3 h-8 w-8 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{csvFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {csvRowData.length > 0
                        ? `${csvRowData.length} records processed`
                        : csvHeaders.length > 0
                          ? `${csvHeaders.length} columns found`
                          : "Processing..."}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-gray-600">
                    Drop your CSV file here or click to browse
                  </p>
                  <button
                    onClick={() => {
                      if (!isCampaignReady) {
                        setFeedback({
                          type: "error",
                          message:
                            "Complete the campaign details above before uploading a CSV file.",
                        });
                        return;
                      }
                      fileInputRef.current?.click();
                    }}
                    disabled={isProcessing || !isCampaignReady}
                    className="font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed"
                  >
                    Choose File
                  </button>
                </div>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="mb-6 flex items-center justify-center text-blue-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-sm">Processing CSV file...</span>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-900">
            Call Settings
          </h3>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              <MessageCircle className="mr-1 inline h-4 w-4" />
              Initial Message Template
            </label>
            <textarea
              value={callSettings.initialMessageTemplate}
              onChange={(e) =>
                handleSettingsChange("initialMessageTemplate", e.target.value)
              }
              placeholder="Hello {name}, this is an automated call..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={3}
              disabled={!isCampaignReady}
            />
            <p className="mt-1 text-xs text-gray-500">
              Use {`{name}`} to personalize the message.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Call Delay (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={callSettings.callDelaySeconds}
                onChange={(e) =>
                  handleSettingsChange(
                    "callDelaySeconds",
                    parseInt(e.target.value, 10) || 5,
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={!isCampaignReady}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={callSettings.startTime}
                onChange={(e) =>
                  handleSettingsChange("startTime", e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={!isCampaignReady}
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="datetime-local"
                value={callSettings.endTime}
                onChange={(e) =>
                  handleSettingsChange("endTime", e.target.value)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={!isCampaignReady}
              />
            </div>
          </div>
        </div>
      </div>

      {csvRowData.length > 0 && (
        <div className="rounded-md border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 className="text-sm font-medium text-gray-700">
              Contacts ({csvRowData.length})
            </h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {csvHeaders.map((header, index) => (
                    <th
                      key={index}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {csvRowData.slice(0, previewLimit).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {csvHeaders.map((header, headerIndex) => (
                      <td key={headerIndex} className="px-4 py-2 text-sm">
                        {editingIndex === index ? (
                          <input
                            type={
                              header === "service_number"
                                ? "number"
                                : header === "phone"
                                  ? "tel"
                                  : "text"
                            }
                            value={row[header] || ""}
                            onChange={(e) =>
                              handleEditContact(index, header, e.target.value)
                            }
                            className={`w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                              header === "service_number"
                                ? "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                : ""
                            }`}
                          />
                        ) : (
                          <span className="text-gray-700">
                            {row[header] || ""}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {editingIndex === index ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(index)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save changes"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-600 hover:text-gray-800"
                              title="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingIndex(index)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit contact"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete contact"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewLimit < csvRowData.length && (
            <div className="bg-gray-50 px-4 py-3 text-center">
              <button
                onClick={handleShowMore}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                Show 10 more ({csvRowData.length - previewLimit} remaining)
              </button>
            </div>
          )}
          {previewLimit >= csvRowData.length && csvRowData.length > 10 && (
            <div className="bg-gray-50 px-4 py-3 text-center text-sm text-gray-600">
              Showing all {csvRowData.length} contacts
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          {csvRowData.length > 0 && (
            <span className="flex items-center">
              <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
              {csvRowData.length} contact
              {csvRowData.length !== 1 ? "s" : ""} ready
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={resetForm}
            disabled={isSubmitting || isProcessing}
            className="rounded-md border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              csvRowData.length === 0 ||
              isSubmitting ||
              isProcessing ||
              !assistantPhoneNumber ||
              !authToken ||
              !isCampaignReady
            }
            className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initiating Call{csvRowData.length > 1 ? "s" : ""}...
              </>
            ) : (
              `Start Call${csvRowData.length > 1 ? "s" : ""} (${csvRowData.length})`
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

const CreateCampaign = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const assistants = useSelector(selectAllAssistants);
  const assistantsLoading = useSelector(selectAssistantsLoading);
  const assistantsError = useSelector(selectAssistantsError);

  const [authToken, setAuthToken] = useState(null);
  const [formData, setFormData] = useState({
    campaignName: "",
    description: "",
    assistantId: "",
    executionMode: "sequential",
  });

  useEffect(() => {
    const loadAssistants = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
        if (token) {
          dispatch(fetchAssistants({ token }));
        }
      } catch (error) {
        console.error("Error loading assistants for campaign:", error);
      }
    };

    loadAssistants();
  }, [dispatch, getToken]);

  const selectedAssistant = useMemo(
    () => assistants.find((assistant) => assistant.id === formData.assistantId),
    [assistants, formData.assistantId],
  );

  const isCampaignReady =
    formData.campaignName.trim().length > 0 &&
    formData.description.trim().length > 0 &&
    formData.assistantId &&
    authToken &&
    !assistantsLoading;

  const handleAssistantChange = (event) => {
    const assistantId = event.target.value;
    setFormData((prev) => ({
      ...prev,
      assistantId,
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full p-6">
        <div className="mx-auto max-w-5xl space-y-8">
          <InlineOutboundCsvUpload
            formData={formData}
            onInputChange={handleInputChange}
            onAssistantChange={handleAssistantChange}
            assistants={assistants}
            assistantsLoading={assistantsLoading}
            assistantsError={assistantsError}
            selectedAssistant={selectedAssistant}
            authToken={authToken}
            isCampaignReady={isCampaignReady}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
