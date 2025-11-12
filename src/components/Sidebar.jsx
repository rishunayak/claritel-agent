import { Link, useLocation } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Bot,
  Plus,
  Users,
  BarChart3,
  Phone,
  X,
  Building2,
  Megaphone,
} from "lucide-react";
import logo from "../assets/logo.webp";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user } = useUser();

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      section: "home",
    },
    {
      id: "all-assistants",
      label: "All Assistants",
      icon: Bot,
      path: "/assistants",
      section: "assistants",
    },
    {
      id: "create-assistant",
      label: "Create Assistant",
      icon: Plus,
      path: "/create-assistant",
      section: "assistants",
    },
    {
      id: "create-campaign",
      label: "Create Campaign",
      icon: Megaphone,
      path: "/create-campaign",
      section: "assistants",
    },
    {
      id: "calls",
      label: "Calls",
      icon: Phone,
      path: "/calls",
      section: "pages",
    },
    {
      id: "members",
      label: "Members",
      icon: Users,
      path: "/members",
      section: "pages",
    },
    {
      id: "companies",
      label: "Companies",
      icon: Building2,
      path: "/companies",
      section: "home",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      path: "/analytics",
      section: "pages",
    },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const NavItem = ({ item, level = 0 }) => {
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
          active
            ? "bg-[#E6E6FE] text-gray-900"
            : "text-gray-600 hover:bg-[#d9d9ff] hover:text-gray-900"
        } ${level > 0 ? "ml-4" : ""}`}
      >
        <item.icon
          className={`h-5 w-5 ${active ? "text-gray-700" : "text-gray-500"}`}
        />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Claritel logo"
                className="h-full w-full object-contain"
              />
            </div>
            <button
              onClick={onToggle}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 md:hidden"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-6">
              {/* Home Section */}
              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                  HOME
                </h3>
                <div className="space-y-1">
                  {navigationItems
                    .filter((item) => item.section === "home")
                    .map((item) => (
                      <NavItem key={item.id} item={item} />
                    ))}
                </div>
              </div>

              {/* Assistants Section */}
              {/* <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                  ASSISTANTS
                </h3>
                <div className="space-y-1">
                  {navigationItems
                    .filter((item) => item.section === "assistants")
                    .map((item) => (
                      <NavItem key={item.id} item={item} />
                    ))}
                </div>
              </div> */}

              {/* Pages Section */}
              {/* <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                  PAGES
                </h3>
                <div className="space-y-1">
                  {navigationItems
                    .filter((item) => item.section === "pages")
                    .map((item) => (
                      <NavItem key={item.id} item={item} />
                    ))}
                </div>
              </div> */}
            </nav>
          </div>

          {/* Account */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-12 h-12",
                  },
                }}
                afterSignOutUrl="/"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName || user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500">Manage your profile</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
