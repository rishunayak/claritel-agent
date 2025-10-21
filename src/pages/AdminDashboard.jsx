import { UserButton, useUser, useAuth } from "@clerk/clerk-react";
import {
  Users,
  Settings,
  Activity,
  TrendingUp,
  BarChart3,
  Shield,
  Database,
  Bell,
  PlusCircle,
  MessageSquare,
  Phone,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAssistants } from "../redux/assistants/assistantsActions";
import {
  selectAllAssistants,
  selectAssistantsLoading,
  selectAssistantsError,
  selectAssistantStats,
} from "../redux/assistants/assistantsSelectors";

const AdminDashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const assistants = useSelector(selectAllAssistants);
  const loading = useSelector(selectAssistantsLoading);
  const error = useSelector(selectAssistantsError);
  const assistantStats = useSelector(selectAssistantStats);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch assistants on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetched && assistants.length === 0) {
        try {
          setHasFetched(true);
          const token = await getToken();
          if (token) {
            dispatch(fetchAssistants(token));
          }
        } catch (err) {
          console.error("Error fetching assistants:", err);
        }
      } else if (!hasFetched && assistants.length > 0) {
        setHasFetched(true);
      }
    };

    fetchData();
  }, [hasFetched, assistants.length, dispatch, getToken]);

  // Helper function to get the first letter of assistant name safely
  const getFirstLetter = (name) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : "?";
  };

  // Helper function to determine color
  const getColor = (name) => {
    const colors = ["blue", "indigo", "purple", "green", "red", "orange", "teal"];
    if (!name || name.length === 0) return colors[0];

    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500">Manage your platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
                afterSignOutUrl="/auth"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
       

        

        {/* Assistants Section */}
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare size={20} className="text-blue-600" />
                </div>
                Voice Assistants
              </h2>
              <button
                onClick={() => navigate("/create-assistant")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusCircle size={18} />
                New Assistant
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center py-12">
                <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 font-medium mb-4">Error: {error}</p>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={async () => {
                      setHasFetched(false);
                      const token = await getToken();
                      if (token) {
                        dispatch(fetchAssistants(token));
                      }
                    }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : assistants.length === 0 ? (
              <div className="py-16 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageSquare size={32} className="text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No assistants yet
                  </h3>
                  <p className="text-gray-500 mb-8">
                    Create your first assistant to get started
                  </p>
                  <button
                    onClick={() => navigate("/create-assistant")}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PlusCircle size={18} className="mr-2" />
                    Create First Assistant
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {assistants.slice(0, 5).map((assistant) => {
                  const color = getColor(assistant.assistant_name);
                  const hasPhoneNumber = Boolean(
                    assistant.default_phone?.phone_number
                  );

                  return (
                    <div
                      key={assistant.id}
                      className="group relative rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-200"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${
                          assistant.is_active
                            ? "bg-gradient-to-r from-blue-400 to-blue-500"
                            : "bg-gradient-to-r from-gray-300 to-gray-400"
                        }`}
                      />

                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${
                                color === "blue"
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                  : color === "indigo"
                                  ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                                  : color === "purple"
                                  ? "bg-gradient-to-br from-purple-500 to-purple-600"
                                  : color === "green"
                                  ? "bg-gradient-to-br from-green-500 to-green-600"
                                  : color === "red"
                                  ? "bg-gradient-to-br from-red-500 to-red-600"
                                  : color === "orange"
                                  ? "bg-gradient-to-br from-orange-500 to-orange-600"
                                  : color === "teal"
                                  ? "bg-gradient-to-br from-teal-500 to-teal-600"
                                  : "bg-gradient-to-br from-blue-500 to-blue-600"
                              }`}
                            >
                              {getFirstLetter(assistant.assistant_name)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-base">
                                {assistant.assistant_name || "Unnamed Assistant"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${
                                    assistant.is_active
                                      ? "bg-emerald-500"
                                      : "bg-gray-400"
                                  }`}
                                ></span>
                                <span
                                  className={`text-xs font-medium ${
                                    assistant.is_active
                                      ? "text-emerald-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {assistant.is_active ? "Active" : "Inactive"}
                                </span>
                                {hasPhoneNumber && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <Phone size={12} className="text-gray-500" />
                                    <span className="text-xs text-gray-600 font-mono">
                                      {assistant.default_phone.phone_number}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                            title="View Details"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {assistants.length > 5 && (
                  <button
                    onClick={() => navigate("/assistants")}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center py-2"
                  >
                    View All {assistants.length} Assistants
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

