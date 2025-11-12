import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Dropdown,
  DropdownItem,
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  Alert,
  Spinner,
  Select,
  Badge,
} from "flowbite-react";
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
  AlertTriangle,
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
  });

  useEffect(() => {
    const fetchCompaniesData = async () => {
      if (user) {
        try {
          const token = await getToken();
          dispatch(fetchCompanies(token));
        } catch (error) {
          console.error("Error getting token:", error);
        }
      }
    };

    fetchCompaniesData();
  }, [dispatch, user, getToken]);

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

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return new Date(b.created_at) - new Date(a.created_at);
      case "updated":
        return new Date(b.updated_at) - new Date(a.updated_at);
      default:
        return 0;
    }
  });

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      return;
    }

    try {
      const token = await getToken();

      await dispatch(
        createCompany({
          ...formData,
          token,
        }),
      ).unwrap();

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
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      url: company.url || "",
      description: company.description || "",
    });
    setShowEditModal(true);
  };

  const handleRefresh = async () => {
    if (user) {
      try {
        const token = await getToken();
        dispatch(fetchCompanies(token));
      } catch (error) {
        console.error("Error refreshing companies:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-indigo-200 bg-indigo-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Companies</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your company information and settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              color="light"
              onClick={handleRefresh}
              disabled={loading}
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              color="blue"
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters and Search Card */}
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <TextInput
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                icon={() => null}
              />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:w-56">
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="created">Sort by Created Date</option>
              <option value="updated">Sort by Updated Date</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert color="failure" icon={AlertTriangle}>
          <span className="font-medium">Error!</span> {error}
        </Alert>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sortedCompanies.map((company) => (
          <Card key={company.id} className="transition-shadow hover:shadow-md">
            {/* Card Header */}
            <div className="-m-6 mb-4 flex items-start justify-between rounded-t-xl bg-indigo-50 p-5">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {company.name}
                </h3>
                <Badge color="indigo" className="mt-2 w-fit">
                  Active
                </Badge>
              </div>
              <Dropdown
                label=""
                dismissOnClick={true}
                renderTrigger={() => (
                  <Button
                    color="light"
                    size="sm"
                    className="p-1.5 text-gray-600 hover:bg-white hover:text-gray-900"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                )}
              >
                <DropdownItem
                  onClick={() =>
                    navigate(`/companies/${company.id}/assistants`, {
                      state: { companyName: company.name },
                    })
                  }
                  className="text-sm hover:bg-indigo-50"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Assistant
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    navigate(`/companies/${company.id}/create-assistant`, {
                      state: { companyName: company.name },
                    })
                  }
                  className="text-sm hover:bg-indigo-50"
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Create Assistant
                </DropdownItem>
                <DropdownItem
                  onClick={() => openEditModal(company)}
                  className="text-sm hover:bg-indigo-50"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownItem>
                <DropdownItem
                  onClick={() => handleDeleteCompany(company.id)}
                  className="text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownItem>
              </Dropdown>
            </div>

            {/* Card Body */}
            <div className="space-y-4">
              {company.url && (
                <Button
                  color="light"
                  size="sm"
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit border-0 bg-transparent p-0 text-indigo-600 hover:bg-transparent hover:text-indigo-700"
                >
                  <Globe className="mr-1.5 h-4 w-4" />
                  <span>Visit Website</span>
                </Button>
              )}

              <p className="text-sm leading-relaxed text-gray-600">
                {company.description || "No description provided yet."}
              </p>

              <hr className="border-gray-100" />

              <div>
                <Badge color="gray" className="mb-2">
                  Last Updated
                </Badge>
                <p className="text-sm text-gray-900">
                  {formatDate(company.updated_at)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  color="blue"
                  size="sm"
                  onClick={() =>
                    navigate(`/companies/${company.id}/assistants`, {
                      state: { companyName: company.name },
                    })
                  }
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  View Assistant
                </Button>
                <Button
                  color="light"
                  size="sm"
                  onClick={() =>
                    navigate(`/companies/${company.id}/create-assistant`, {
                      state: { companyName: company.name },
                    })
                  }
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Create Assistant
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedCompanies.length === 0 && !loading && (
        <Card className="text-center">
          <div className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No companies found
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by creating your first company"}
            </p>
            {!searchTerm && (
              <Button
                color="blue"
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Company
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="text-center">
          <div className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
              <Spinner size="lg" color="blue" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Loading companies...
            </h3>
          </div>
        </Card>
      )}

      {/* Create Company Modal */}
      <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <Modal.Header className="border-b border-indigo-100 bg-indigo-50">
          Create New Company
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-5">
            <div>
              <Label
                htmlFor="name"
                value="Company Name"
                className="mb-2 text-sm font-medium text-gray-900"
              />
              <TextInput
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter company name"
                required
                color="blue"
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                value="Company Description"
                className="mb-2 text-sm font-medium text-gray-900"
              />
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the company"
                rows={4}
                required
                color="blue"
              />
            </div>
            <div>
              <Label
                htmlFor="url"
                value="Website URL"
                className="mb-2 text-sm font-medium text-gray-900"
              />
              <TextInput
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com"
                color="blue"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                color="gray"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCompany}
                color="blue"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Create Company
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Edit Company Modal */}
      <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
        <Modal.Header className="border-b border-indigo-100 bg-indigo-50">
          Edit Company
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-5">
            <div>
              <Label
                htmlFor="edit-name"
                value="Company Name"
                className="mb-2 text-sm font-medium text-gray-900"
              />
              <TextInput
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter company name"
                required
                color="blue"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-description"
                value="Company Description"
                className="mb-2 text-sm font-medium text-gray-900"
              />
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe the company"
                rows={4}
                required
                color="blue"
              />
            </div>
            <div>
              <Label
                htmlFor="edit-url"
                value="Website URL"
                className="mb-2 text-sm font-medium text-gray-900"
              />
              <TextInput
                id="edit-url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com"
                color="blue"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={() => setShowEditModal(false)}
                color="gray"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditCompany}
                color="blue"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                Update Company
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CompaniesPage;
