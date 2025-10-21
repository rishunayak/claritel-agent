import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bot, 
  Phone, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus,
  RefreshCw,
  Calendar,
  User,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from "lucide-react";

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('10d');

  // Mock data - in real app this would come from API
  const stats = {
    totalAssistants: 12,
    activeAssistants: 8,
    totalCalls: 1247,
    successfulCalls: 1089,
    totalMembers: 22900,
    paidMembers: 24300,
    freeMembers: 22900 - 24300, // This would be negative, showing churn
    callSuccessRate: 87.3,
    avgCallDuration: '4m 32s'
  };

  const recentCalls = [
    {
      id: 1,
      assistant: "Customer Support Bot",
      member: "John Doe",
      duration: "3m 45s",
      status: "completed",
      timestamp: "2 minutes ago"
    },
    {
      id: 2,
      assistant: "Sales Assistant",
      member: "Jane Smith",
      duration: "2m 12s",
      status: "completed",
      timestamp: "5 minutes ago"
    },
    {
      id: 3,
      assistant: "Technical Support",
      member: "Mike Johnson",
      duration: "6m 23s",
      status: "completed",
      timestamp: "8 minutes ago"
    }
  ];

  const topAssistants = [
    {
      id: 1,
      name: "Customer Support Bot",
      calls: 245,
      successRate: 94.2,
      avgDuration: "3m 45s",
      trend: "up",
      change: 12
    },
    {
      id: 2,
      name: "Sales Assistant",
      calls: 189,
      successRate: 89.1,
      avgDuration: "4m 12s",
      trend: "up",
      change: 8
    },
    {
      id: 3,
      name: "Technical Support",
      calls: 156,
      successRate: 92.3,
      avgDuration: "5m 33s",
      trend: "down",
      change: 3
    }
  ];

  // Mock chart data for the last 10 days
  const chartData = [
    { date: "1 Jun", free: 22900, paid: 24300 },
    { date: "2 Jun", free: 23100, paid: 24500 },
    { date: "3 Jun", free: 22800, paid: 24700 },
    { date: "4 Jun", free: 23000, paid: 24600 },
    { date: "5 Jun", free: 22700, paid: 24800 },
    { date: "6 Jun", free: 23200, paid: 25000 },
    { date: "7 Jun", free: 23100, paid: 25100 },
    { date: "8 Jun", free: 23300, paid: 25200 },
    { date: "9 Jun", free: 23000, paid: 25300 },
    { date: "10 Jun", free: 22900, paid: 24300 }
  ];

  const maxValue = Math.max(...chartData.map(d => d.free + d.paid));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your assistants.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="10d">Last 10 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Assistants Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+12%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAssistants}</p>
            <p className="text-sm text-gray-600">Total Assistants</p>
            <p className="text-xs text-gray-500 mt-1">{stats.activeAssistants} active</p>
          </div>
        </div>

        {/* Calls Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+8%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCalls.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Calls</p>
            <p className="text-xs text-gray-500 mt-1">{stats.callSuccessRate}% success rate</p>
          </div>
        </div>

        {/* Members Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+14.5%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.paidMembers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Paid Members</p>
            <p className="text-xs text-gray-500 mt-1">+3,200 this month</p>
          </div>
        </div>

        {/* Free Members Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex items-center text-red-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">-0.2%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Free Members</p>
            <p className="text-xs text-gray-500 mt-1">-50 this month</p>
          </div>
        </div>
      </div>

      {/* Members Chart Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Members</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded"></div>
                <span className="text-sm text-gray-600">Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-600 rounded" style={{background: 'repeating-linear-gradient(45deg, #9333ea, #9333ea 2px, #a855f7 2px, #a855f7 4px)'}}></div>
                <span className="text-sm text-gray-600">Paid</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers.toLocaleString()}</p>
              <div className="flex items-center text-red-600">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span className="text-sm">0.2%</span>
              </div>
              <p className="text-xs text-gray-500">Free</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.paidMembers.toLocaleString()}</p>
              <div className="flex items-center text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">14.5%</span>
              </div>
              <p className="text-xs text-gray-500">Paid</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 flex items-end justify-between gap-2">
          {chartData.map((data, index) => {
            const totalHeight = ((data.free + data.paid) / maxValue) * 100;
            const paidHeight = (data.paid / (data.free + data.paid)) * totalHeight;
            const freeHeight = totalHeight - paidHeight;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full h-48 flex flex-col justify-end">
                  <div 
                    className="w-full bg-purple-600"
                    style={{ height: `${paidHeight}%` }}
                  ></div>
                  <div 
                    className="w-full bg-purple-600"
                    style={{ 
                      height: `${freeHeight}%`,
                      background: 'repeating-linear-gradient(45deg, #9333ea, #9333ea 2px, #a855f7 2px, #a855f7 4px)'
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{data.date}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Assistants Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Top Assistants</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {topAssistants.map((assistant, index) => (
            <div key={assistant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{assistant.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{assistant.calls} calls</span>
                    <span>{assistant.successRate}% success</span>
                    <span>Avg: {assistant.avgDuration}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {assistant.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    assistant.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {assistant.change}%
                  </span>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Calls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Calls</h2>
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{call.assistant}</p>
                    <p className="text-sm text-gray-600">{call.member}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{call.duration}</p>
                  <p className="text-xs text-gray-500">{call.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/create-assistant"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create New Assistant</p>
                <p className="text-sm text-gray-600">Set up a new AI assistant</p>
              </div>
            </Link>
            
            <Link
              to="/assistants"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Assistants</p>
                <p className="text-sm text-gray-600">View and edit existing assistants</p>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-600">Check performance metrics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
