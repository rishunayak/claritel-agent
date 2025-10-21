import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Filter
} from "lucide-react";

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('calls');

  // Mock analytics data
  const analyticsData = {
    totalCalls: 1247,
    successfulCalls: 1089,
    failedCalls: 158,
    avgCallDuration: '4m 32s',
    totalMembers: 22900,
    activeAssistants: 8,
    callSuccessRate: 87.3,
    memberGrowth: 14.5,
    callGrowth: 8.2
  };

  const callTrends = [
    { date: "1 Jun", calls: 45, success: 40, failed: 5 },
    { date: "2 Jun", calls: 52, success: 48, failed: 4 },
    { date: "3 Jun", calls: 38, success: 35, failed: 3 },
    { date: "4 Jun", calls: 61, success: 54, failed: 7 },
    { date: "5 Jun", calls: 48, success: 42, failed: 6 },
    { date: "6 Jun", calls: 55, success: 50, failed: 5 },
    { date: "7 Jun", calls: 67, success: 58, failed: 9 },
    { date: "8 Jun", calls: 72, success: 65, failed: 7 },
    { date: "9 Jun", calls: 58, success: 52, failed: 6 },
    { date: "10 Jun", calls: 63, success: 56, failed: 7 }
  ];

  const topPerformers = [
    {
      name: "Customer Support Bot",
      calls: 245,
      successRate: 94.2,
      avgDuration: "3m 45s",
      trend: "up",
      change: 12
    },
    {
      name: "Sales Assistant",
      calls: 189,
      successRate: 89.1,
      avgDuration: "4m 12s",
      trend: "up",
      change: 8
    },
    {
      name: "Technical Support",
      calls: 156,
      successRate: 92.3,
      avgDuration: "5m 33s",
      trend: "down",
      change: 3
    }
  ];

  const maxCalls = Math.max(...callTrends.map(d => d.calls));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track performance and insights across your assistants</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+{analyticsData.callGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalCalls.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Calls</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+2.1%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.callSuccessRate}%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+5.2%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.avgCallDuration}</p>
            <p className="text-sm text-gray-600">Avg Duration</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+{analyticsData.memberGrowth}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{analyticsData.totalMembers.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Members</p>
          </div>
        </div>
      </div>

      {/* Call Trends Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Call Trends</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Successful</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Failed</span>
            </div>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-2">
          {callTrends.map((data, index) => {
            const successHeight = (data.success / maxCalls) * 100;
            const failedHeight = (data.failed / maxCalls) * 100;
            
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full h-48 flex flex-col justify-end">
                  <div 
                    className="w-full bg-red-500"
                    style={{ height: `${failedHeight}%` }}
                  ></div>
                  <div 
                    className="w-full bg-green-500"
                    style={{ height: `${successHeight}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{data.date}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Top Performing Assistants</h2>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        <div className="space-y-4">
          {topPerformers.map((assistant, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">#{index + 1}</span>
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
              <div className="flex items-center gap-2">
                {assistant.trend === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  assistant.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {assistant.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Peak Performance Hours</p>
                <p className="text-sm text-gray-600">Your assistants perform best between 10 AM - 2 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Language Preferences</p>
                <p className="text-sm text-gray-600">English calls have 15% higher success rate</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Call Duration Trends</p>
                <p className="text-sm text-gray-600">Average call duration increased by 8% this month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.successfulCalls}</p>
              <p className="text-sm text-gray-600">Successful Calls</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.failedCalls}</p>
              <p className="text-sm text-gray-600">Failed Calls</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{analyticsData.activeAssistants}</p>
              <p className="text-sm text-gray-600">Active Assistants</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600">Availability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
