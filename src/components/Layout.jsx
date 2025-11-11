import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content */}
      <div className="md:ml-80">
        {/* Page Content */}
        <main className="p-6">
          <button
            onClick={toggleSidebar}
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
