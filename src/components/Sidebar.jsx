import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bot, 
  Plus, 
  Users, 
  BarChart3, 
  Phone, 
  Menu,
  X,
  Building2
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      section: 'home'
    },
    {
      id: 'all-assistants',
      label: 'All Assistants',
      icon: Bot,
      path: '/assistants',
      section: 'assistants'
    },
    {
      id: 'create-assistant',
      label: 'Create Assistant',
      icon: Plus,
      path: '/create-assistant',
      section: 'assistants'
    },
    {
      id: 'calls',
      label: 'Calls',
      icon: Phone,
      path: '/calls',
      section: 'pages'
    },
    {
      id: 'members',
      label: 'Members',
      icon: Users,
      path: '/members',
      section: 'pages'
    },
    {
      id: 'companies',
      label: 'Companies',
      icon: Building2,
      path: '/companies',
      section: 'pages'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      section: 'pages'
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const NavItem = ({ item, level = 0 }) => {
    const active = isActive(item.path);

    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer group ${
          active 
            ? 'bg-gray-200 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${level > 0 ? 'ml-4' : ''}`}
      >
        <item.icon className={`h-5 w-5 ${active ? 'text-gray-700' : 'text-gray-500'}`} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Claritel</h1>
                <p className="text-xs text-gray-500">AI Assistant Platform</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>


          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-6">
            <nav className="space-y-6">
              {/* Home Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">HOME</h3>
                <div className="space-y-1">
                  {navigationItems.filter(item => item.section === 'home').map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Assistants Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">ASSISTANTS</h3>
                <div className="space-y-1">
                  {navigationItems.filter(item => item.section === 'assistants').map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Pages Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">PAGES</h3>
                <div className="space-y-1">
                  {navigationItems.filter(item => item.section === 'pages').map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

            </nav>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
