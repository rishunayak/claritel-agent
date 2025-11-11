import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import {
  fetchAssistants,
  updateAssistant,
} from "../redux/assistants/assistantsActions";
import { fetchCompanies } from "../redux/companies/companiesActions";
import {
  selectAllAssistants,
  selectAssistantsLoading,
  selectAssistantsError,
} from "../redux/assistants/assistantsSelectors";
import {
  selectAllCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
} from "../redux/companies/companiesSelectors";
import {
  Bot,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Trash2,
  Phone,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Database,
  ChevronDown,
  X,
  Save,
  ArrowLeft,
  Loader2,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { getBaseUrl } from "../redux/assistants/assistantsActions";

const AssistantsPage = () => {
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // Redux state
  const assistants = useSelector(selectAllAssistants);
  const isLoading = useSelector(selectAssistantsLoading);
  const error = useSelector(selectAssistantsError);
  const companies = useSelector(selectAllCompanies);
  const companiesLoading = useSelector(selectCompaniesLoading);
  const companiesError = useSelector(selectCompaniesError);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [editFormData, setEditFormData] = useState({
    assistant_name: "",
    description: "",
    agent_description: "",
    website_url: "",
    specialization: "support",
    call_preference: "inbound",
    language: "en",
    is_active: true,
  });

  // Services mode state
  const [isServicesMode, setIsServicesMode] = useState(false);
  const [servicesAssistant, setServicesAssistant] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [opLoading, setOpLoading] = useState({
    add: false,
    update: "",
    delete: "",
    ai: false,
  });

  // Databases mode state
  const [isDatabasesMode, setIsDatabasesMode] = useState(false);
  const [dbAssistant, setDbAssistant] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [databasesLoading, setDatabasesLoading] = useState(false);
  const [databasesError, setDatabasesError] = useState("");
  const [dbSearch, setDbSearch] = useState("");
  const [isAddingDatabase, setIsAddingDatabase] = useState(false);
  const [newDb, setNewDb] = useState({ display_name: "", description: "" });
  const [editingDbId, setEditingDbId] = useState(null);
  const [editDb, setEditDb] = useState({ display_name: "", description: "" });
  const [dbOpLoading, setDbOpLoading] = useState({
    add: false,
    update: "",
    delete: "",
  });
  const [expandedDbId, setExpandedDbId] = useState(null);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [tableRecords, setTableRecords] = useState([]);
  const [tableMeta, setTableMeta] = useState(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [newRecordData, setNewRecordData] = useState({});
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editRecordJson, setEditRecordJson] = useState("");
  const [editRecordData, setEditRecordData] = useState({});
  const [recordOpLoading, setRecordOpLoading] = useState({
    add: false,
    update: "",
    delete: "",
  });

  // Schema management state
  const [activeTab, setActiveTab] = useState("schema"); // "schema" or "data"
  const [schemaColumns, setSchemaColumns] = useState([]);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumn, setNewColumn] = useState({
    display_name: "",
    type: "string",
    required: false,
    is_primary_key: false,
  });
  const [editColumn, setEditColumn] = useState({
    display_name: "",
    type: "string",
    required: false,
    is_primary_key: false,
  });
  const [schemaOpLoading, setSchemaOpLoading] = useState({
    add: false,
    update: false,
    delete: null,
  });

  // Fetch assistants and companies on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (token) {
          dispatch(fetchAssistants({ token }));
          dispatch(fetchCompanies(token));
        }
      } catch (error) {
        console.error("Error getting token for data fetch:", error);
      }
    };

    fetchData();
  }, [dispatch, getToken]);

  // Handle URL query parameter for company filter
  useEffect(() => {
    const companyParam = searchParams.get("company");
    if (companyParam) {
      // Remove quotes if present (handles encoded quotes like %22)
      const companyId = companyParam.replace(/"/g, "");
      // Only set the filter if the company exists in the companies list
      if (companies.length > 0) {
        const companyExists = companies.some(
          (company) => company.id === companyId,
        );
        if (companyExists) {
          setFilterCompany(companyId);
        }
      } else {
        // If companies haven't loaded yet, set the filter anyway
        // It will be validated when companies load
        setFilterCompany(companyId);
      }
    }
  }, [searchParams, companies]);

  const filteredAssistants = assistants.filter((assistant) => {
    const matchesSearch =
      assistant.assistant_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      assistant.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatusFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && assistant.is_active) ||
      (filterStatus === "inactive" && !assistant.is_active);
    const matchesCompanyFilter =
      filterCompany === "all" || assistant.company_id === filterCompany;
    return matchesSearch && matchesStatusFilter && matchesCompanyFilter;
  });

  const getStatusIcon = (isActive) => {
    return isActive ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        Inactive
      </span>
    );
  };

  const getSpecializationBadge = (specialization) => {
    const colors = {
      customer_support: "bg-blue-100 text-blue-800",
      sales: "bg-green-100 text-green-800",
      technical: "bg-purple-100 text-purple-800",
      scheduling: "bg-orange-100 text-orange-800",
      general: "bg-gray-100 text-gray-800",
    };

    const labels = {
      customer_support: "Customer Support",
      sales: "Sales",
      technical: "Technical",
      scheduling: "Scheduling",
      general: "General",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[specialization] || colors.general}`}
      >
        {labels[specialization] || "General"}
      </span>
    );
  };

  const getCompanyName = (companyId) => {
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : "Unknown Company";
  };

  const handleDropdownToggle = (assistantId) => {
    setOpenDropdown(openDropdown === assistantId ? null : assistantId);
  };

  const handleEdit = (assistantId) => {
    console.log("Edit clicked for assistant ID:", assistantId);
    const assistant = assistants.find((a) => a.id === assistantId);
    console.log("Found assistant:", assistant);
    if (assistant) {
      setEditingAssistant(assistant);
      setEditFormData({
        assistant_name: assistant.assistant_name || "",
        description: assistant.description || "",
        agent_description: assistant.agent_description || "",
        website_url: assistant.website_url || "",
        specialization: assistant.specialization || "support",
        call_preference: assistant.call_preference || "inbound",
        language: assistant.language || "en",
        is_active: assistant.is_active || true,
      });
      setIsEditMode(true);
    }
    setOpenDropdown(null);
  };

  const handleDelete = (assistantId) => {
    console.log("Delete assistant:", assistantId);
    setOpenDropdown(null);
  };

  const handleService = (assistantId) => {
    const assistant = assistants.find((a) => a.id === assistantId);
    if (!assistant) return;
    setServicesAssistant(assistant);
    setIsServicesMode(true);
    setOpenDropdown(null);
  };

  const handleDatabase = (assistantId) => {
    const assistant = assistants.find((a) => a.id === assistantId);
    if (!assistant) return;
    setDbAssistant(assistant);
    setIsDatabasesMode(true);
    setOpenDropdown(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting edit for assistant:", editingAssistant);
    if (!editingAssistant) return;

    try {
      const token = await getToken();
      if (!token) {
        alert("Authentication token not available");
        return;
      }

      console.log("Updating assistant with ID:", editingAssistant.id);
      await dispatch(
        updateAssistant({
          id: editingAssistant.id,
          data: {
            ...editFormData,
            company_id: editingAssistant.company_id,
          },
          token,
        }),
      );

      // Close edit mode and refresh data
      setIsEditMode(false);
      setEditingAssistant(null);

      // Refresh assistants list
      dispatch(fetchAssistants({ token }));
    } catch (error) {
      console.error("Error updating assistant:", error);
      alert("Failed to update assistant. Please try again.");
    }
  };

  const handleBackToAssistants = () => {
    setIsEditMode(false);
    setEditingAssistant(null);
    setEditFormData({
      assistant_name: "",
      description: "",
      agent_description: "",
      website_url: "",
      specialization: "support",
      call_preference: "inbound",
      language: "en",
      is_active: true,
    });
  };

  const handleBackFromServices = () => {
    setIsServicesMode(false);
    setServicesAssistant(null);
    setServices([]);
    setSearchQuery("");
    setAddingNew(false);
    setNewDescription("");
    setEditingServiceId(null);
    setEditDescription("");
    setServicesError("");
  };

  const handleBackFromDatabases = () => {
    setIsDatabasesMode(false);
    setDbAssistant(null);
    setDatabases([]);
    setDbSearch("");
    setIsAddingDatabase(false);
    setNewDb({ display_name: "", description: "" });
    setEditingDbId(null);
    setEditDb({ display_name: "", description: "" });
    setDatabasesError("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  // Services helpers
  const filteredServices = services.filter(
    (s) =>
      (s.task_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.task_description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const fetchServicesForAssistant = async (assistantId) => {
    try {
      setServicesLoading(true);
      setServicesError("");
      const token = await getToken();
      const baseUrl = getBaseUrl();
      const res = await axios.get(
        `${baseUrl}/api/assistants/${assistantId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setServices(res.data || []);
    } catch (e) {
      setServicesError(
        e?.response?.data?.detail || e.message || "Failed to load services",
      );
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (isServicesMode && servicesAssistant?.id) {
      fetchServicesForAssistant(servicesAssistant.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isServicesMode, servicesAssistant?.id]);

  // Databases helpers
  const toSnake = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const filteredDatabases = databases.filter(
    (db) =>
      (db.display_name || "").toLowerCase().includes(dbSearch.toLowerCase()) ||
      (db.description || "").toLowerCase().includes(dbSearch.toLowerCase()),
  );

  const fetchDatabasesForAssistant = async (assistantId) => {
    try {
      setDatabasesLoading(true);
      setDatabasesError("");
      const token = await getToken();
      const baseUrl = getBaseUrl();
      const res = await axios.get(
        `${baseUrl}/api/assistants/${assistantId}/tables`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDatabases(res.data || []);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to load databases",
      );
    } finally {
      setDatabasesLoading(false);
    }
  };

  useEffect(() => {
    if (isDatabasesMode && dbAssistant?.id) {
      fetchDatabasesForAssistant(dbAssistant.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDatabasesMode, dbAssistant?.id]);

  const handleSaveNewDatabase = async () => {
    if (!newDb.display_name.trim()) return;
    try {
      setDbOpLoading((p) => ({ ...p, add: true }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      const payload = {
        name: toSnake(newDb.display_name),
        display_name: newDb.display_name,
        description: newDb.description || "",
        columns: [],
      };
      await axios.post(
        `${baseUrl}/api/assistants/${dbAssistant.id}/tables`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setNewDb({ display_name: "", description: "" });
      setIsAddingDatabase(false);
      fetchDatabasesForAssistant(dbAssistant.id);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to create database",
      );
    } finally {
      setDbOpLoading((p) => ({ ...p, add: false }));
    }
  };

  const handleUpdateDatabase = async () => {
    if (!editingDbId || !editDb.display_name.trim()) return false;
    try {
      setDbOpLoading((p) => ({ ...p, update: editingDbId }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      const payload = {
        display_name: editDb.display_name,
        description: editDb.description || "",
      };
      await axios.put(`${baseUrl}/api/tables/${editingDbId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setEditingDbId(null);
      setEditDb({ display_name: "", description: "" });
      fetchDatabasesForAssistant(dbAssistant.id);
      return true;
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to update database",
      );
      return false;
    } finally {
      setDbOpLoading((p) => ({ ...p, update: "" }));
    }
  };

  const handleDeleteDatabase = async (tableId) => {
    try {
      setDbOpLoading((p) => ({ ...p, delete: tableId }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      await axios.delete(`${baseUrl}/api/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDatabasesForAssistant(dbAssistant.id);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to delete database",
      );
    } finally {
      setDbOpLoading((p) => ({ ...p, delete: "" }));
    }
  };

  const fetchTableRecordsFor = async (tableId) => {
    try {
      setRecordsLoading(true);
      setDatabasesError("");
      const token = await getToken();
      const baseUrl = getBaseUrl();
      const res = await axios.get(`${baseUrl}/api/tables/${tableId}/records`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTableRecords(res.data || []);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail ||
          e.message ||
          "Failed to load table records",
      );
    } finally {
      setRecordsLoading(false);
    }
  };

  const toggleExpandDb = (tableId) => {
    const next = expandedDbId === tableId ? null : tableId;
    setExpandedDbId(next);
    if (next) {
      fetchTableMeta(next);
      fetchTableRecordsFor(next);
      setIsAddingRecord(false);
      setNewRecordData({});
      setEditingRecordId(null);
      setEditRecordJson("");
    }
  };

  const fetchTableMeta = async (tableId) => {
    try {
      const token = await getToken();
      const baseUrl = getBaseUrl();
      const res = await axios.get(`${baseUrl}/api/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTableMeta(res.data || null);
      setSchemaColumns(res.data?.columns || []);
      setActiveTab("schema"); // Default to schema tab when expanding
    } catch (e) {
      setTableMeta(null);
      setSchemaColumns([]);
    }
  };

  const handleNewRecordInput = (field, value) => {
    setNewRecordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditRecordInput = (field, value) => {
    setEditRecordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRecord = async (tableId, columns = []) => {
    try {
      setRecordOpLoading((p) => ({ ...p, add: true }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      // Prepare a single record based on available inputs (fallback to empty object)
      const record = { ...newRecordData };
      // Ensure empty strings for missing optional fields to avoid NaN
      columns.forEach((c) => {
        if (record[c.name] === undefined) record[c.name] = "";
      });
      await axios.post(
        `${baseUrl}/api/tables/${tableId}/records`,
        { records: [record] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setIsAddingRecord(false);
      setNewRecordData({});
      fetchTableRecordsFor(tableId);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to add record",
      );
    } finally {
      setRecordOpLoading((p) => ({ ...p, add: false }));
    }
  };

  const startEditRecord = (record) => {
    setEditingRecordId(record.id);
    try {
      // Get user data (already parsed or parse if string)
      const userData =
        typeof record.data === "string"
          ? JSON.parse(record.data)
          : record.data || {};
      setEditRecordData(userData);
      setEditRecordJson(JSON.stringify(userData, null, 2));
    } catch {
      setEditRecordData({});
      setEditRecordJson("{}");
    }
  };

  const saveEditRecord = async () => {
    if (!editingRecordId) return;
    try {
      setRecordOpLoading((p) => ({ ...p, update: editingRecordId }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      await axios.put(
        `${baseUrl}/api/records/${editingRecordId}`,
        { data: editRecordData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setEditingRecordId(null);
      setEditRecordJson("");
      setEditRecordData({});
      if (expandedDbId) fetchTableRecordsFor(expandedDbId);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to update record",
      );
    } finally {
      setRecordOpLoading((p) => ({ ...p, update: "" }));
    }
  };

  const deleteRecord = async (recordId) => {
    try {
      setRecordOpLoading((p) => ({ ...p, delete: recordId }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      await axios.delete(`${baseUrl}/api/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (expandedDbId) fetchTableRecordsFor(expandedDbId);
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to delete record",
      );
    } finally {
      setRecordOpLoading((p) => ({ ...p, delete: "" }));
    }
  };

  // Schema management functions
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAddColumn = () => {
    setIsAddingColumn(true);
    setNewColumn({
      display_name: "",
      type: "string",
      required: false,
      is_primary_key: false,
    });
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
    setEditColumn({
      display_name: column.display_name || column.name,
      type: column.type,
      required: column.required || false,
      is_primary_key: column.is_primary_key || false,
    });
  };

  const handleSaveNewColumn = async () => {
    if (!newColumn.display_name.trim()) {
      setDatabasesError("Column name cannot be empty");
      return;
    }

    const systemName = toSnake(newColumn.display_name);
    if (schemaColumns.some((col) => col.name === systemName)) {
      setDatabasesError("A column with this name already exists");
      return;
    }

    if (
      newColumn.is_primary_key &&
      schemaColumns.some((col) => col.is_primary_key)
    ) {
      setDatabasesError(
        "A primary key already exists. Only one primary key is allowed.",
      );
      return;
    }

    try {
      setSchemaOpLoading((p) => ({ ...p, add: true }));
      const token = await getToken();
      const baseUrl = getBaseUrl();

      // Prepare the column data
      const columnToAdd = {
        name: systemName,
        display_name: newColumn.display_name,
        type: newColumn.type,
        required: newColumn.required,
        is_primary_key:
          schemaColumns.length === 0 ? true : newColumn.is_primary_key,
      };

      // Update table with new column
      const updatedColumns = [...schemaColumns, columnToAdd];

      await axios.put(
        `${baseUrl}/api/tables/${expandedDbId}`,
        {
          columns: updatedColumns,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSchemaColumns(updatedColumns);
      setIsAddingColumn(false);
      setNewColumn({
        display_name: "",
        type: "string",
        required: false,
        is_primary_key: false,
      });
      setDatabasesError("");
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to add column",
      );
    } finally {
      setSchemaOpLoading((p) => ({ ...p, add: false }));
    }
  };

  const handleUpdateColumn = async () => {
    if (!editColumn.display_name.trim()) {
      setDatabasesError("Column name cannot be empty");
      return;
    }

    const newSystemName = toSnake(editColumn.display_name);
    const currentColumn = schemaColumns.find(
      (col) => col.name === editingColumn.name,
    );

    if (
      newSystemName !== editingColumn.name &&
      schemaColumns.some((col) => col.name === newSystemName)
    ) {
      setDatabasesError("A column with this name already exists");
      return;
    }

    try {
      setSchemaOpLoading((p) => ({ ...p, update: true }));
      const token = await getToken();
      const baseUrl = getBaseUrl();

      // Update column in the columns array
      const updatedColumns = schemaColumns.map((col) =>
        col.name === editingColumn.name
          ? {
              ...col,
              name: newSystemName,
              display_name: editColumn.display_name,
              type: editColumn.type,
              required: editColumn.required,
              is_primary_key: editColumn.is_primary_key,
            }
          : col,
      );

      await axios.put(
        `${baseUrl}/api/tables/${expandedDbId}`,
        {
          columns: updatedColumns,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSchemaColumns(updatedColumns);
      setEditingColumn(null);
      setEditColumn({
        display_name: "",
        type: "string",
        required: false,
        is_primary_key: false,
      });
      setDatabasesError("");
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to update column",
      );
    } finally {
      setSchemaOpLoading((p) => ({ ...p, update: false }));
    }
  };

  const handleDeleteColumn = async (columnName) => {
    try {
      setSchemaOpLoading((p) => ({ ...p, delete: columnName }));
      const token = await getToken();
      const baseUrl = getBaseUrl();

      // Remove column from the columns array
      const updatedColumns = schemaColumns.filter(
        (col) => col.name !== columnName,
      );

      // Ensure there's always a primary key if we're deleting the primary key and other columns exist
      if (
        schemaColumns.find((col) => col.name === columnName)?.is_primary_key &&
        updatedColumns.length > 0 &&
        !updatedColumns.some((col) => col.is_primary_key)
      ) {
        updatedColumns[0] = { ...updatedColumns[0], is_primary_key: true };
      }

      await axios.put(
        `${baseUrl}/api/tables/${expandedDbId}`,
        {
          columns: updatedColumns,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSchemaColumns(updatedColumns);
      setDatabasesError("");
    } catch (e) {
      setDatabasesError(
        e?.response?.data?.detail || e.message || "Failed to delete column",
      );
    } finally {
      setSchemaOpLoading((p) => ({ ...p, delete: null }));
    }
  };

  const handleBackFromSchema = () => {
    setActiveTab("schema");
    setSchemaColumns([]);
    setIsAddingColumn(false);
    setEditingColumn(null);
    setNewColumn({
      display_name: "",
      type: "string",
      required: false,
      is_primary_key: false,
    });
    setEditColumn({
      display_name: "",
      type: "string",
      required: false,
      is_primary_key: false,
    });
  };

  const handleAddService = async () => {
    if (!newDescription.trim()) return;
    try {
      setOpLoading((p) => ({ ...p, add: true }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      await axios.post(
        `${baseUrl}/api/assistants/${servicesAssistant.id}/tasks`,
        { task_description: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setNewDescription("");
      setAddingNew(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 2500);
      fetchServicesForAssistant(servicesAssistant.id);
    } catch (e) {
      setServicesError(
        e?.response?.data?.detail || e.message || "Failed to add service",
      );
    } finally {
      setOpLoading((p) => ({ ...p, add: false }));
    }
  };

  const handleUpdateService = async () => {
    if (!editingServiceId || !editDescription.trim()) return;
    try {
      setOpLoading((p) => ({ ...p, update: editingServiceId }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      await axios.put(
        `${baseUrl}/api/assistants/${servicesAssistant.id}/tasks/${editingServiceId}`,
        { task_description: editDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setEditingServiceId(null);
      setEditDescription("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 2500);
      fetchServicesForAssistant(servicesAssistant.id);
    } catch (e) {
      setServicesError(
        e?.response?.data?.detail || e.message || "Failed to update service",
      );
    } finally {
      setOpLoading((p) => ({ ...p, update: "" }));
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      setOpLoading((p) => ({ ...p, delete: serviceId }));
      const token = await getToken();
      const baseUrl = getBaseUrl();
      await axios.delete(
        `${baseUrl}/api/assistants/${servicesAssistant.id}/tasks/${serviceId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchServicesForAssistant(servicesAssistant.id);
    } catch (e) {
      setServicesError(
        e?.response?.data?.detail || e.message || "Failed to delete service",
      );
    } finally {
      setOpLoading((p) => ({ ...p, delete: "" }));
    }
  };

  const handleEnhanceWithAI = async () => {
    try {
      setOpLoading((p) => ({ ...p, ai: true }));
      const baseUrl = getBaseUrl();
      const token = await getToken();
      const res = await axios.post(
        `${baseUrl}/api/assistants/enhance-services`,
        { services_text: newDescription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res?.data?.enhanced_text) setNewDescription(res.data.enhanced_text);
    } catch (e) {
      // silently fail enhancement
    } finally {
      setOpLoading((p) => ({ ...p, ai: false }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading assistants...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <div className="mb-2 text-red-600">⚠️</div>
        <h3 className="mb-2 font-medium text-red-800">
          Error Loading Assistants
        </h3>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // If in edit mode, show the edit form
  if (isEditMode) {
    return (
      <div className="space-y-1">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackToAssistants}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Assistants</span>
          </button>
        </div>

        {/* Edit Form */}
        <div className="rounded-xl bg-gray-50 px-2">
          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Assistant
              </h1>
              <p className="mt-2 text-gray-600">
                Update the basic information for your assistant
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Assistant Name */}
              <div>
                <label
                  htmlFor="edit_assistant_name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Assistant Name *
                </label>
                <input
                  type="text"
                  id="edit_assistant_name"
                  name="assistant_name"
                  value={editFormData.assistant_name}
                  onChange={handleEditFormChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                  placeholder="e.g., Customer Support Bot"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="edit_description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Description *
                </label>
                <textarea
                  id="edit_description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                  placeholder="Assistant description"
                />
              </div>

              {/* Agent Description */}
              <div>
                <label
                  htmlFor="edit_agent_description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Agent Description
                </label>
                <textarea
                  id="edit_agent_description"
                  name="agent_description"
                  value={editFormData.agent_description}
                  onChange={handleEditFormChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                  placeholder="Agent description"
                />
              </div>

              {/* Website URL and Language */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit_website_url"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="edit_website_url"
                    name="website_url"
                    value={editFormData.website_url}
                    onChange={handleEditFormChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit_language"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Language
                  </label>
                  <select
                    id="edit_language"
                    name="language"
                    value={editFormData.language}
                    onChange={handleEditFormChange}
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

              {/* Specialization and Call Preference */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit_specialization"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Specialization
                  </label>
                  <select
                    id="edit_specialization"
                    name="specialization"
                    value={editFormData.specialization}
                    onChange={handleEditFormChange}
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
                    htmlFor="edit_call_preference"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Call Preference
                  </label>
                  <select
                    id="edit_call_preference"
                    name="call_preference"
                    value={editFormData.call_preference}
                    onChange={handleEditFormChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-gray-500 focus:ring-0"
                  >
                    <option value="inbound">Inbound Only</option>
                    <option value="outbound">Outbound Only</option>
                    <option value="both">Both Inbound & Outbound</option>
                  </select>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  name="is_active"
                  checked={editFormData.is_active}
                  onChange={handleEditFormChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="edit_is_active"
                  className="text-sm font-medium text-gray-700"
                >
                  Assistant is active
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={handleBackToAssistants}
                  className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If in services mode, show the services manager
  if (isServicesMode) {
    return (
      <div className="space-y-1">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleBackFromServices}
            className="mr-3 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <span className="ml-3 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-700">
            {servicesLoading ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                ...
              </span>
            ) : (
              services.length
            )}
          </span>
        </div>

        {servicesError && (
          <div className="mb-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <div className="text-sm">{servicesError}</div>
          </div>
        )}

        {submitSuccess && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
            Saved successfully
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">
                Services for {servicesAssistant?.assistant_name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm focus:border-gray-500 focus:ring-0"
                />
              </div>
              <button
                onClick={() => setAddingNew(true)}
                disabled={addingNew || opLoading.add}
                className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors ${addingNew || opLoading.add ? "bg-gray-200 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {opLoading.add ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Service
                  </span>
                )}
              </button>
            </div>
          </div>

          {addingNew && (
            <div className="border-b border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-medium text-blue-900">
                  Add New Service
                </h3>
                <button
                  onClick={() => setAddingNew(false)}
                  className="rounded-full p-1 text-blue-700 hover:bg-blue-100"
                  disabled={opLoading.add}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Describe what this service will provide..."
                  disabled={opLoading.add || opLoading.ai}
                />
                <div className="absolute right-2 bottom-2">
                  <button
                    type="button"
                    onClick={handleEnhanceWithAI}
                    disabled={opLoading.ai}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {opLoading.ai ? (
                      <span className="inline-flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Enhancing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Enhance with AI
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setAddingNew(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  disabled={opLoading.add}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddService}
                  disabled={opLoading.add || !newDescription.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  {opLoading.add ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Add Service
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Services list */}
          <div className="divide-y divide-gray-200">
            {servicesLoading ? (
              <div className="p-6 text-sm text-gray-500">
                Loading services...
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="p-10 text-center text-gray-600">
                No services found
              </div>
            ) : (
              filteredServices.map((service) => (
                <div key={service.id} className="p-6">
                  <div className="flex justify-between">
                    <div className="flex">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        {service.task_name && (
                          <div className="text-lg font-medium text-gray-900">
                            {service.task_name}
                          </div>
                        )}
                        <div className="mt-1 text-gray-700">
                          {service.task_description}
                        </div>
                        {service.table_reference?.table_name && (
                          <div className="mt-2 inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">
                            {service.table_reference.table_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => {
                          setEditingServiceId(service.id);
                          setEditDescription(service.task_description || "");
                        }}
                        disabled={
                          opLoading.update || opLoading.delete === service.id
                        }
                        className={`rounded-lg p-2 ${editingServiceId === service.id ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        disabled={opLoading.delete === service.id}
                        className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
                      >
                        {opLoading.delete === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {editingServiceId === service.id && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Edit Description
                      </label>
                      <textarea
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingServiceId(null);
                            setEditDescription("");
                          }}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          disabled={opLoading.update === service.id}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateService}
                          disabled={
                            opLoading.update === service.id ||
                            !editDescription.trim()
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                          {opLoading.update === service.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" /> Save Description
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // If in databases mode, show the databases manager
  if (isDatabasesMode) {
    return (
      <div className="space-y-1">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleBackFromDatabases}
            className="mr-3 rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Manage Databases</h1>
          <span className="ml-3 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-700">
            {databasesLoading ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                ...
              </span>
            ) : (
              databases.length
            )}
          </span>
        </div>

        {databasesError && (
          <div className="mb-4 flex items-start rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <div className="text-sm">{databasesError}</div>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center">
              <Database className="mr-2 h-5 w-5 text-blue-600" />
              <span className="text-lg font-medium text-gray-900">
                Tables for {dbAssistant?.assistant_name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={dbSearch}
                  onChange={(e) => setDbSearch(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm focus:border-gray-500 focus:ring-0"
                />
              </div>
              <button
                onClick={() => setIsAddingDatabase(true)}
                disabled={isAddingDatabase || dbOpLoading.add}
                className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors ${isAddingDatabase || dbOpLoading.add ? "bg-gray-200 text-gray-600" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                {dbOpLoading.add ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Table
                  </span>
                )}
              </button>
            </div>
          </div>

          {isAddingDatabase && (
            <div className="border-b border-blue-200 bg-blue-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-medium text-blue-900">
                  Add New Table
                </h3>
                <button
                  onClick={() => setIsAddingDatabase(false)}
                  className="rounded-full p-1 text-blue-700 hover:bg-blue-100"
                  disabled={dbOpLoading.add}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newDb.display_name}
                    onChange={(e) =>
                      setNewDb((p) => ({ ...p, display_name: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Customers"
                    disabled={dbOpLoading.add}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newDb.description}
                    onChange={(e) =>
                      setNewDb((p) => ({ ...p, description: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="Short description"
                    disabled={dbOpLoading.add}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingDatabase(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  disabled={dbOpLoading.add}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewDatabase}
                  disabled={dbOpLoading.add || !newDb.display_name.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  {dbOpLoading.add ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Create Table
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200">
            {databasesLoading ? (
              <div className="p-6 text-sm text-gray-500">Loading tables...</div>
            ) : filteredDatabases.length === 0 ? (
              <div className="p-10 text-center text-gray-600">
                No tables found
              </div>
            ) : (
              filteredDatabases.map((db) => (
                <div key={db.id} className="p-6">
                  <div className="flex justify-between">
                    <div>
                      <div className="text-lg font-medium text-gray-900">
                        {db.display_name}
                      </div>
                      <div className="mt-1 text-gray-700">{db.description}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleExpandDb(db.id)}
                        className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                      >
                        {expandedDbId === db.id ? (
                          <>
                            <ChevronDown className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 rotate-180" />
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingDbId(db.id);
                          setEditDb({
                            display_name: db.display_name || "",
                            description: db.description || "",
                          });
                        }}
                        disabled={
                          dbOpLoading.update || dbOpLoading.delete === db.id
                        }
                        className={`rounded-lg p-2 ${editingDbId === db.id ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDatabase(db.id)}
                        disabled={dbOpLoading.delete === db.id}
                        className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
                      >
                        {dbOpLoading.delete === db.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {editingDbId === db.id && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={editDb.display_name}
                            onChange={(e) =>
                              setEditDb((p) => ({
                                ...p,
                                display_name: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <input
                            type="text"
                            value={editDb.description}
                            onChange={(e) =>
                              setEditDb((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingDbId(null);
                            setEditDb({ display_name: "", description: "" });
                          }}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                          disabled={dbOpLoading.update === db.id}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateDatabase}
                          disabled={
                            dbOpLoading.update === db.id ||
                            !editDb.display_name.trim()
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                        >
                          {dbOpLoading.update === db.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />{" "}
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" /> Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {expandedDbId === db.id && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50">
                      {/* Tabs */}
                      <div className="border-b border-gray-200 bg-gray-100">
                        <div className="flex">
                          <button
                            className={`px-4 py-2 text-sm font-medium ${
                              activeTab === "schema"
                                ? "border-t-2 border-blue-600 bg-white text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => handleTabChange("schema")}
                          >
                            <Settings className="mr-1 inline-block h-4 w-4" />
                            Schema
                          </button>
                          <button
                            className={`px-4 py-2 text-sm font-medium ${
                              activeTab === "data"
                                ? "border-t-2 border-blue-600 bg-white text-blue-600"
                                : "text-gray-600 hover:text-gray-800"
                            }`}
                            onClick={() => handleTabChange("data")}
                            disabled={!tableMeta?.columns?.length}
                          >
                            <Database className="mr-1 inline-block h-4 w-4" />
                            Table Data
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {activeTab === "schema" ? (
                          // Schema Tab Content
                          <div>
                            {databasesError && (
                              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                                <div className="text-sm text-red-700">
                                  {databasesError}
                                </div>
                              </div>
                            )}
                            <div className="mb-6 flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900">
                                Table Columns
                              </h3>
                              <button
                                onClick={handleAddColumn}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                              >
                                <Plus className="h-4 w-4" />
                                Add Column
                              </button>
                            </div>

                            {isAddingColumn && (
                              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <div className="mb-4 text-sm font-medium text-gray-700">
                                  Add New Column
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      Column Name
                                    </label>
                                    <input
                                      type="text"
                                      value={newColumn.display_name}
                                      onChange={(e) =>
                                        setNewColumn((p) => ({
                                          ...p,
                                          display_name: e.target.value,
                                        }))
                                      }
                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                      placeholder="Column Name"
                                      disabled={schemaOpLoading.add}
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                      Data Type
                                    </label>
                                    <select
                                      value={newColumn.type}
                                      onChange={(e) =>
                                        setNewColumn((p) => ({
                                          ...p,
                                          type: e.target.value,
                                        }))
                                      }
                                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                      disabled={schemaOpLoading.add}
                                    >
                                      <option value="string">String</option>
                                      <option value="number">Number</option>
                                      <option value="boolean">Boolean</option>
                                      <option value="date">Date</option>
                                    </select>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={newColumn.required}
                                        onChange={(e) =>
                                          setNewColumn((p) => ({
                                            ...p,
                                            required: e.target.checked,
                                          }))
                                        }
                                        className="mr-2"
                                        disabled={schemaOpLoading.add}
                                      />
                                      <span className="text-sm text-gray-700">
                                        Required
                                      </span>
                                    </label>
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={newColumn.is_primary_key}
                                        onChange={(e) =>
                                          setNewColumn((p) => ({
                                            ...p,
                                            is_primary_key: e.target.checked,
                                          }))
                                        }
                                        className="mr-2"
                                        disabled={schemaOpLoading.add}
                                      />
                                      <span className="text-sm text-gray-700">
                                        Primary Key
                                      </span>
                                    </label>
                                  </div>
                                </div>
                                <div className="mt-4 flex justify-end gap-2">
                                  <button
                                    onClick={() => setIsAddingColumn(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                    disabled={schemaOpLoading.add}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSaveNewColumn}
                                    disabled={
                                      schemaOpLoading.add ||
                                      !newColumn.display_name.trim()
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                                  >
                                    {schemaOpLoading.add ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4" /> Add Column
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="divide-y divide-gray-200">
                              {schemaColumns.length === 0 ? (
                                <div className="p-6 text-center text-gray-600">
                                  No columns defined. Add a column to begin.
                                </div>
                              ) : (
                                schemaColumns.map((column, index) => (
                                  <div key={index} className="p-4">
                                    {editingColumn?.name === column.name ? (
                                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <div className="mb-4 text-sm font-medium text-gray-700">
                                          Edit Column
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                          <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                              Column Name
                                            </label>
                                            <input
                                              type="text"
                                              value={editColumn.display_name}
                                              onChange={(e) =>
                                                setEditColumn((p) => ({
                                                  ...p,
                                                  display_name: e.target.value,
                                                }))
                                              }
                                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                              disabled={schemaOpLoading.update}
                                            />
                                          </div>
                                          <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                              Data Type
                                            </label>
                                            <select
                                              value={editColumn.type}
                                              onChange={(e) =>
                                                setEditColumn((p) => ({
                                                  ...p,
                                                  type: e.target.value,
                                                }))
                                              }
                                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                                              disabled={schemaOpLoading.update}
                                            >
                                              <option value="string">
                                                String
                                              </option>
                                              <option value="number">
                                                Number
                                              </option>
                                              <option value="boolean">
                                                Boolean
                                              </option>
                                              <option value="date">Date</option>
                                            </select>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <label className="flex items-center">
                                              <input
                                                type="checkbox"
                                                checked={editColumn.required}
                                                onChange={(e) =>
                                                  setEditColumn((p) => ({
                                                    ...p,
                                                    required: e.target.checked,
                                                  }))
                                                }
                                                className="mr-2"
                                                disabled={
                                                  schemaOpLoading.update
                                                }
                                              />
                                              <span className="text-sm text-gray-700">
                                                Required
                                              </span>
                                            </label>
                                            <label className="flex items-center">
                                              <input
                                                type="checkbox"
                                                checked={
                                                  editColumn.is_primary_key
                                                }
                                                onChange={(e) =>
                                                  setEditColumn((p) => ({
                                                    ...p,
                                                    is_primary_key:
                                                      e.target.checked,
                                                  }))
                                                }
                                                className="mr-2"
                                                disabled={
                                                  schemaOpLoading.update
                                                }
                                              />
                                              <span className="text-sm text-gray-700">
                                                Primary Key
                                              </span>
                                            </label>
                                          </div>
                                        </div>
                                        <div className="mt-4 flex justify-end gap-2">
                                          <button
                                            onClick={() =>
                                              setEditingColumn(null)
                                            }
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                            disabled={schemaOpLoading.update}
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={handleUpdateColumn}
                                            disabled={
                                              schemaOpLoading.update ||
                                              !editColumn.display_name.trim()
                                            }
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                                          >
                                            {schemaOpLoading.update ? (
                                              <>
                                                <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                                Updating...
                                              </>
                                            ) : (
                                              <>
                                                <Save className="h-4 w-4" />{" "}
                                                Save Changes
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div>
                                            <div className="font-medium text-gray-900">
                                              {column.display_name ||
                                                column.name}
                                            </div>
                                            <div className="font-mono text-sm text-gray-500">
                                              {column.name}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                              {column.type}
                                            </span>
                                            {column.required && (
                                              <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">
                                                Required
                                              </span>
                                            )}
                                            {column.is_primary_key && (
                                              <span className="rounded bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                                                Primary Key
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() =>
                                              handleEditColumn(column)
                                            }
                                            className="rounded-lg p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleDeleteColumn(column.name)
                                            }
                                            className="rounded-lg p-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                            disabled={
                                              schemaOpLoading.delete ===
                                              column.name
                                            }
                                          >
                                            {schemaOpLoading.delete ===
                                            column.name ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ) : (
                          // Data Tab Content
                          <div>
                            <div className="mb-3 flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-700">
                                Table Records
                              </div>
                              <button
                                onClick={() => fetchTableRecordsFor(db.id)}
                                className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                              >
                                Refresh
                              </button>
                            </div>

                            {tableMeta?.columns?.length > 0 && (
                              <div className="mb-4 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Column
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Type
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Required
                                      </th>
                                      <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Primary Key
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 bg-white">
                                    {tableMeta.columns.map((c, i) => (
                                      <tr key={i}>
                                        <td className="px-3 py-2 text-sm text-gray-700">
                                          {c.display_name || c.name}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-500">
                                          <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                            {c.type}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700">
                                          {c.required ? "Yes" : "No"}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-700">
                                          {c.is_primary_key ? "Yes" : "No"}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            <div className="mb-4">
                              {!isAddingRecord ? (
                                <button
                                  onClick={() => setIsAddingRecord(true)}
                                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                  Add Record
                                </button>
                              ) : (
                                <div className="rounded-md border border-blue-200 bg-white p-3">
                                  <div className="mb-2 text-sm font-medium text-gray-700">
                                    New Record
                                  </div>
                                  {tableMeta?.columns?.length ? (
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                      {tableMeta.columns.map((c, i) => (
                                        <div key={i}>
                                          <label className="mb-1 block text-xs font-medium text-gray-600">
                                            {c.display_name || c.name}
                                          </label>
                                          <input
                                            type="text"
                                            value={newRecordData[c.name] ?? ""}
                                            onChange={(e) =>
                                              handleNewRecordInput(
                                                c.name,
                                                e.target.value,
                                              )
                                            }
                                            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <textarea
                                      rows={4}
                                      value={JSON.stringify(
                                        newRecordData,
                                        null,
                                        2,
                                      )}
                                      onChange={(e) => {
                                        try {
                                          setNewRecordData(
                                            JSON.parse(e.target.value || "{}"),
                                          );
                                        } catch {}
                                      }}
                                      className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                      placeholder="Enter JSON record"
                                    />
                                  )}
                                  <div className="mt-3 flex justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        setIsAddingRecord(false);
                                        setNewRecordData({});
                                      }}
                                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                      disabled={recordOpLoading.add}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleAddRecord(
                                          db.id,
                                          tableMeta?.columns || [],
                                        )
                                      }
                                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                                      disabled={recordOpLoading.add}
                                    >
                                      {recordOpLoading.add ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                          Saving...
                                        </>
                                      ) : (
                                        <>
                                          <Save className="h-4 w-4" /> Save
                                          Record
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {recordsLoading ? (
                              <div className="text-sm text-gray-500">
                                Loading records...
                              </div>
                            ) : tableRecords.length === 0 ? (
                              <div className="text-sm text-gray-600">
                                No records
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      {tableMeta?.columns?.map((column) => (
                                        <th
                                          key={column.name}
                                          className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                                        >
                                          {column.display_name || column.name}
                                        </th>
                                      ))}
                                      <th className="px-3 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 bg-white">
                                    {tableRecords
                                      .slice(0, 25)
                                      .map((row, idx) => {
                                        // Get user data from the DATA column
                                        const userData =
                                          typeof row.data === "string"
                                            ? row.data
                                              ? JSON.parse(row.data)
                                              : {}
                                            : row.data || {};
                                        return (
                                          <tr
                                            key={idx}
                                            className="hover:bg-gray-50"
                                          >
                                            {tableMeta?.columns?.map(
                                              (column) => (
                                                <td
                                                  key={column.name}
                                                  className="px-3 py-2 text-sm text-gray-700"
                                                >
                                                  {editingRecordId ===
                                                  row.id ? (
                                                    <input
                                                      type="text"
                                                      value={
                                                        editRecordData[
                                                          column.name
                                                        ] ?? ""
                                                      }
                                                      onChange={(e) =>
                                                        handleEditRecordInput(
                                                          column.name,
                                                          e.target.value,
                                                        )
                                                      }
                                                      className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                      disabled={
                                                        recordOpLoading.update ===
                                                        row.id
                                                      }
                                                    />
                                                  ) : (
                                                    <span>
                                                      {userData[column.name] ??
                                                        ""}
                                                    </span>
                                                  )}
                                                </td>
                                              ),
                                            )}
                                            <td className="px-3 py-2 text-sm text-gray-700">
                                              {editingRecordId === row.id ? (
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    onClick={() => {
                                                      setEditingRecordId(null);
                                                      setEditRecordJson("");
                                                      setEditRecordData({});
                                                    }}
                                                    className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                                                    disabled={
                                                      recordOpLoading.update ===
                                                      row.id
                                                    }
                                                  >
                                                    Cancel
                                                  </button>
                                                  <button
                                                    onClick={saveEditRecord}
                                                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                                    disabled={
                                                      recordOpLoading.update ===
                                                      row.id
                                                    }
                                                  >
                                                    {recordOpLoading.update ===
                                                    row.id ? (
                                                      <>
                                                        <Loader2 className="h-3 w-3 animate-spin" />{" "}
                                                        Saving...
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Save className="h-3 w-3" />{" "}
                                                        Save
                                                      </>
                                                    )}
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    onClick={() =>
                                                      startEditRecord(row)
                                                    }
                                                    className="rounded-md p-1 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                                  >
                                                    <Edit className="h-4 w-4" />
                                                  </button>
                                                  <button
                                                    onClick={() =>
                                                      deleteRecord(row.id)
                                                    }
                                                    className="rounded-md p-1 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                                    disabled={
                                                      recordOpLoading.delete ===
                                                      row.id
                                                    }
                                                  >
                                                    {recordOpLoading.delete ===
                                                    row.id ? (
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                      <Trash2 className="h-4 w-4" />
                                                    )}
                                                  </button>
                                                </div>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                                {tableRecords.length > 25 && (
                                  <div className="mt-2 text-xs text-gray-500">
                                    Showing first 25 records
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default assistants list view
  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between"></div>

      {/* Filters and Search with Assistant Cards */}
      <div className="rounded-xl bg-gray-50 px-2">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-gray-500 focus:ring-0"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:ring-0"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Company Filter */}
          <div className="lg:w-48">
            <div className="relative">
              <select
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:ring-0"
                disabled={companiesLoading}
              >
                <option value="all">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {/* Show indicator when company filter is applied via URL */}
              {filterCompany !== "all" && searchParams.get("company") && (
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500"></div>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:ring-0"
            >
              <option value="name">Sort by Name</option>
              <option value="calls">Sort by Calls</option>
              <option value="success">Sort by Success Rate</option>
              <option value="created">Sort by Created Date</option>
            </select>
          </div>
        </div>

        {/* Assistants Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAssistants.map((assistant) => (
            <div
              key={assistant.id}
              className="rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {assistant.assistant_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {assistant.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(assistant.is_active)}
                  <div className="dropdown-container relative">
                    <button
                      onClick={() => handleDropdownToggle(assistant.id)}
                      className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === assistant.id && (
                      <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-xl">
                        {/* Arrow */}
                        <div className="absolute -top-1 right-4 h-2 w-2 rotate-45 transform border-t border-l border-gray-200 bg-white"></div>

                        <div className="py-2">
                          <button
                            onClick={() => handleEdit(assistant.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors first:rounded-t-lg hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleService(assistant.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Service</span>
                          </button>
                          <button
                            onClick={() => handleDatabase(assistant.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <Database className="h-4 w-4" />
                            <span>Database</span>
                          </button>
                          <button
                            onClick={() => handleDelete(assistant.id)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-700 transition-colors last:rounded-b-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Specialization */}
              <div className="mb-4 flex items-center gap-2">
                {getStatusBadge(assistant.is_active)}
                {getSpecializationBadge(assistant.specialization)}
              </div>

              {/* Stats */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {assistant.total_calls || 0}
                  </p>
                  <p className="text-xs text-gray-500">Total Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {assistant.success_rate || 0}%
                  </p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Company</span>
                  <span className="font-medium">
                    {getCompanyName(assistant.company_id)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">
                    {assistant.language || "English"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Call Preference</span>
                  <span className="font-medium capitalize">
                    {assistant.call_preference || "Inbound"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(assistant.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
                  {assistant.is_active ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAssistants.length === 0 && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Bot className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No assistants found
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm || filterStatus !== "all" || filterCompany !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first assistant"}
            </p>
            <Link
              to="/create-assistant"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Create Your First Assistant</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantsPage;
