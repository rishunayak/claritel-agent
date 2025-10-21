import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  ChevronDown
} from "lucide-react";

const AssistantsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Mock data - in real app this would come from API
  const assistants = [
    {
      id: 1,
      name: "Customer Support Bot",
      description: "Handles customer inquiries and support tickets",
      status: "active",
      calls: 1247,
      successRate: 94.2,
      avgDuration: "3m 45s",
      lastActive: "2 minutes ago",
      specialization: "customer_support",
      languages: ["English", "Spanish"],
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Sales Assistant",
      description: "Qualifies leads and handles sales inquiries",
      status: "active",
      calls: 892,
      successRate: 89.1,
      avgDuration: "4m 12s",
      lastActive: "5 minutes ago",
      specialization: "sales",
      languages: ["English"],
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      name: "Technical Support",
      description: "Provides technical assistance and troubleshooting",
      status: "inactive",
      calls: 456,
      successRate: 92.3,
      avgDuration: "5m 33s",
      lastActive: "1 hour ago",
      specialization: "technical",
      languages: ["English", "French"],
      createdAt: "2024-01-10"
    },
    {
      id: 4,
      name: "Appointment Scheduler",
      description: "Handles appointment booking and scheduling",
      status: "active",
      calls: 234,
      successRate: 96.8,
      avgDuration: "2m 15s",
      lastActive: "10 minutes ago",
      specialization: "scheduling",
      languages: ["English", "Spanish", "French"],
      createdAt: "2024-02-01"
    }
  ];

  const filteredAssistants = assistants.filter(assistant => {
    const matchesSearch = assistant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assistant.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || assistant.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    return status === "active" ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
      general: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      customer_support: "Customer Support",
      sales: "Sales",
      technical: "Technical",
      scheduling: "Scheduling",
      general: "General"
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[specialization] || colors.general}`}>
        {labels[specialization] || "General"}
      </span>
    );
  };

  const handleDropdownToggle = (assistantId) => {
    setOpenDropdown(openDropdown === assistantId ? null : assistantId);
  };

  const handleEdit = (assistantId) => {
    console.log("Edit assistant:", assistantId);
    setOpenDropdown(null);
  };

  const handleDelete = (assistantId) => {
    console.log("Delete assistant:", assistantId);
    setOpenDropdown(null);
  };

  const handleService = (assistantId) => {
    console.log("Service assistant:", assistantId);
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="flex items-center justify-between">
      </div>

      {/* Filters and Search with Assistant Cards */}
      <div className="bg-gray-50 rounded-xl px-2">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assistants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:border-gray-500"
            >
              <option value="name">Sort by Name</option>
              <option value="calls">Sort by Calls</option>
              <option value="success">Sort by Success Rate</option>
              <option value="created">Sort by Created Date</option>
            </select>
          </div>
        </div>

        {/* Assistants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssistants.map((assistant) => (
          <div key={assistant.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{assistant.name}</h3>
                  <p className="text-sm text-gray-600">{assistant.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(assistant.status)}
                <div className="relative dropdown-container">
                  <button 
                    onClick={() => handleDropdownToggle(assistant.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openDropdown === assistant.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                      {/* Arrow */}
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                      
                      <div className="py-2">
                        <button
                          onClick={() => handleEdit(assistant.id)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleService(assistant.id)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Service</span>
                        </button>
                        <button
                          onClick={() => handleDelete(assistant.id)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors last:rounded-b-lg"
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
            <div className="flex items-center gap-2 mb-4">
              {getStatusBadge(assistant.status)}
              {getSpecializationBadge(assistant.specialization)}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{assistant.calls.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Calls</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{assistant.successRate}%</p>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Duration</span>
                <span className="font-medium">{assistant.avgDuration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Active</span>
                <span className="font-medium">{assistant.lastActive}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Languages</span>
                <span className="font-medium">{assistant.languages.join(", ")}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                {assistant.status === "active" ? (
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
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assistants found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first assistant"
              }
            </p>
            <Link
              to="/create-assistant"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
