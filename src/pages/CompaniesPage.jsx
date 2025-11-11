import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  RefreshCw,
  Bot,
  Eye,
} from "lucide-react";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../redux/companies/companiesActions";
import { resetCompaniesState } from "../redux/companies/companiesSlice";
import {
  selectAllCompanies,
  selectCompaniesLoading,
  selectCompaniesError,
} from "../redux/companies/companiesSelectors";
const CompaniesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const companies = useSelector(selectAllCompanies);
  const loading = useSelector(selectCompaniesLoading);
  const error = useSelector(selectCompaniesError);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
  });

  // Debug logging
  console.log("Companies state:", { companies, loading, error });
  console.log("Form data:", formData);
  console.log("Show create modal:", showCreateModal);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompaniesData = async () => {
      if (user) {
        try {
          const token = await getToken();
          console.log(
            "Fetching companies with token:",
            token ? "Token received" : "No token",
          );
          dispatch(fetchCompanies(token));
        } catch (error) {
          console.error("Error getting token:", error);
        }
      } else {
        console.log("No user found");
      }
    };

    fetchCompaniesData();
  }, [dispatch, user, getToken]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetCompaniesState());
    };
  }, [dispatch]);

  const normalizedSearch = searchTerm.toLowerCase();

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      (company.name || "").toLowerCase().includes(normalizedSearch) ||
      (company.url || "").toLowerCase().includes(normalizedSearch) ||
      (company.description || "").toLowerCase().includes(normalizedSearch);
    return matchesSearch;
  });

  const handleDropdownToggle = (companyId) => {
    setOpenDropdown(openDropdown === companyId ? null : companyId);
  };

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    console.log("Create company form submitted:", formData);

    if (!formData.name || !formData.description) {
      console.log("Form validation failed - missing fields");
      return;
    }

    try {
      const token = await getToken();
      console.log(
        "Creating company with token:",
        token ? "Token received" : "No token",
      );

      const result = await dispatch(
        createCompany({
          ...formData,
          token,
        }),
      ).unwrap();

      console.log("Company created successfully:", result);
      setFormData({ name: "", url: "", description: "" });
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  const handleEditCompany = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) return;

    try {
      const token = await getToken();
      await dispatch(
        updateCompany({
          id: editingCompany.id,
          ...formData,
          token,
        }),
      ).unwrap();

      setFormData({ name: "", url: "", description: "" });
      setEditingCompany(null);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?"))
      return;

    try {
      const token = await getToken();
      await dispatch(deleteCompany({ id: companyId, token })).unwrap();
    } catch (error) {
      console.error("Error deleting company:", error);
    }
    setOpenDropdown(null);
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      url: company.url || "",
      description: company.description || "",
    });
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  return (
    <div className="space-y-8 rounded-3xl bg-gradient-to-b from-[#E6E6FF] via-white to-white p-4 shadow-sm md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D7D7FF] bg-gradient-to-r from-[#E6E6FF] via-white to-[#E6E6FF] p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-gray-600">
            Manage your company information and settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (user) {
                try {
                  const token = await getToken();
                  console.log("Manual refresh - fetching companies");
                  dispatch(fetchCompanies(token));
                } catch (error) {
                  console.error("Error refreshing companies:", error);
                }
              }
            }}
            className="flex items-center gap-2 rounded-xl border border-[#C6C6FF] bg-[#E6E6FF] px-4 py-2 font-medium text-indigo-700 transition-all hover:-translate-y-0.5 hover:bg-[#d9d9ff] hover:shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              console.log("Add Company button clicked");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-transparent bg-[#E6E6FF] px-4 py-2 font-semibold text-indigo-700 shadow-md transition-all hover:-translate-y-0.5 hover:border-[#C6C6FF] hover:bg-[#d9d9ff] hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-2xl p-6 backdrop-blur-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[#DADAFE] py-2 pr-4 pl-10 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[#DADAFE] px-4 py-2 text-sm text-gray-700 shadow-sm transition hover:border-[#C6C6FF] focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
            >
              <option value="name">Sort by Name</option>
              <option value="created">Sort by Created Date</option>
              <option value="updated">Sort by Updated Date</option>
            </select>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-[#e4e4ff] bg-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.4)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(79,70,229,0.45)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-[#E6E6FF] px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {company.name}
                </h3>
                <div className="dropdown-container relative">
                  <button
                    onClick={() => handleDropdownToggle(company.id)}
                    className="rounded-full p-2 text-gray-700 transition-colors hover:bg-white/60"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === company.id && (
                    <div className="absolute top-full right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-[#ececff] bg-white shadow-2xl">
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          navigate(`/companies/${company.id}/assistants`, {
                            state: { companyName: company.name },
                          });
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-[#f8f8ff]"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Assistant</span>
                      </button>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          navigate(
                            `/companies/${company.id}/create-assistant`,
                            {
                              state: { companyName: company.name },
                            },
                          );
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-[#f8f8ff]"
                      >
                        <Bot className="h-4 w-4" />
                        <span>Create Assistant</span>
                      </button>
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          openEditModal(company);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-[#f8f8ff]"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-4 px-6 py-6">
                {company.url && (
                  <a
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-fit items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Website</span>
                  </a>
                )}

                <p className="text-sm text-gray-600">
                  {company.description || "No description provided yet."}
                </p>

                <div className="h-px w-full bg-[#edeefe]" />

                <div>
                  <p className="text-xs tracking-wide text-gray-400 uppercase">
                    Last updated
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(company.updated_at)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() =>
                      navigate(`/companies/${company.id}/assistants`, {
                        state: { companyName: company.name },
                      })
                    }
                    className="flex w-full items-center justify-center rounded-2xl bg-[#E6E6FF] py-3 text-sm font-semibold text-indigo-700 transition hover:bg-[#d8d8ff]"
                  >
                    View Assistant
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/companies/${company.id}/create-assistant`, {
                        state: { companyName: company.name },
                      })
                    }
                    className="flex w-full items-center justify-center rounded-2xl border border-[#E6E6FF] bg-white py-3 text-sm font-semibold text-indigo-700 transition hover:bg-[#E6E6FF]"
                  >
                    Create Assistant
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCompanies.length === 0 && !loading && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No companies found
            </h3>
            <p className="mb-6 text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by creating your first company"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-[#E6E6FF] px-4 py-2 font-semibold text-indigo-700 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#C6C6FF] hover:bg-[#d9d9ff] hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Company</span>
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#6366f1]"></div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Loading companies...
            </h3>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Create Company Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 md:left-80"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log("Modal backdrop clicked - closing modal");
              setShowCreateModal(false);
            }
          }}
        >
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[#E0E0FF] bg-white/95 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Create New Company
            </h2>
            <form
              onSubmit={(e) => {
                console.log("Form submit event triggered");
                handleCreateCompany(e);
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DADAFE] px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DADAFE] px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
                    placeholder="Describe the company"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DADAFE] px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-[#E0E0FF] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#E6E6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl border border-transparent bg-[#E6E6FF] px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:-translate-y-0.5 hover:border-[#C6C6FF] hover:bg-[#d9d9ff] hover:shadow-lg"
                >
                  Create Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 md:left-80">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[#E0E0FF] bg-white/95 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Edit Company
            </h2>
            <form onSubmit={handleEditCompany}>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DADAFE] px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Company Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DADAFE] px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
                    placeholder="Describe the company"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    className="w-full rounded-xl border border-[#DADAFE] px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-[#6366f1] focus:ring-2 focus:ring-[#E6E6FF]"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl border border-[#E0E0FF] bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#E6E6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl border border-transparent bg-[#E6E6FF] px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:-translate-y-0.5 hover:border-[#C6C6FF] hover:bg-[#d9d9ff] hover:shadow-lg"
                >
                  Update Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
