import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { ArrowLeft, RefreshCw, Bot, Calendar, Users, Loader2 } from "lucide-react";
import { fetchAssistants } from "../redux/assistants/assistantsActions";
import {
  selectAllAssistants,
  selectAssistantsLoading,
  selectAssistantsError,
} from "../redux/assistants/assistantsSelectors";

const CompanyAssistantsPage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [companyName, setCompanyName] = useState(
    location.state?.companyName || "",
  );
  const assistants = useSelector(selectAllAssistants);
  const loading = useSelector(selectAssistantsLoading);
  const error = useSelector(selectAssistantsError);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadAssistants = async () => {
      if (!companyId) return;
      try {
        const token = await getToken();
        dispatch(fetchAssistants({ token, companyId }));
      } catch (tokenError) {
        console.error("Error retrieving token:", tokenError);
        dispatch(fetchAssistants({ companyId }));
      }
    };

    loadAssistants();
  }, [companyId, dispatch, getToken]);

  const companyAssistants = assistants.filter((assistant) => {
    const idCandidates = [
      assistant.company_id,
      assistant.companyId,
      assistant.company?.id,
    ]
      .filter((value) => value !== undefined && value !== null)
      .map((value) => String(value));

    return idCandidates.includes(String(companyId));
  });

  useEffect(() => {
    if (!companyName && companyAssistants.length > 0) {
      const firstAssistant = companyAssistants[0];
      setCompanyName(
        firstAssistant.company_name ||
          firstAssistant.company?.name ||
          companyName,
      );
    }
  }, [companyAssistants, companyName]);

  const handleRefresh = async () => {
    try {
      const token = await getToken();
      dispatch(fetchAssistants({ token, companyId }));
    } catch (tokenError) {
      console.error("Error retrieving token:", tokenError);
      dispatch(fetchAssistants({ companyId }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/companies")}
          className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[#E6E6FF] px-3 py-2 text-sm font-medium text-indigo-700 transition hover:border-[#CBCBFF] hover:bg-[#d9d9ff]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 rounded-full border border-[#E0E0FF] bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-[#F3F3FF]"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="rounded-3xl border border-[#E0E0FF] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {companyName || "Company"} Assistants
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and monitor the assistants that belong to this company.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-[#E6E6FF] bg-[#F6F6FF] px-4 py-3 text-sm text-indigo-600">
            <Users className="h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-indigo-500">
                Assistants
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {companyAssistants.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E6E6FF] bg-white px-6 py-4 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">
              Loading assistants...
            </span>
          </div>
        </div>
      ) : companyAssistants.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E0E0FF] bg-white px-6 py-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EDEEFF] text-indigo-600">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            No assistants yet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your first assistant to start supporting this company.
          </p>
          <Link
            to={`/companies/${companyId}/create-assistant`}
            state={{ companyName }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E6E6FF] px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-[#d8d8ff]"
          >
            <Bot className="h-4 w-4" />
            <span>Create Assistant</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {companyAssistants.map((assistant) => (
            <div
              key={assistant.id || assistant.assistant_id}
              className="flex flex-col rounded-3xl border border-[#ECECFF] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assistant.assistant_name || assistant.name || "Assistant"}
                  </h3>
                  {assistant.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {assistant.description}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-[#EDEEFF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {assistant.is_active === false ? "Inactive" : "Active"}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-2xl border border-[#F0F0FF] bg-[#F9F9FF] px-4 py-3">
                  <Bot className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Specialization
                    </p>
                    <p className="font-medium text-gray-900">
                      {assistant.specialization || "General"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-[#F0F0FF] bg-[#F9F9FF] px-4 py-3">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Updated
                    </p>
                    <p className="font-medium text-gray-900">
                      {formatDate(assistant.updated_at || assistant.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyAssistantsPage;

