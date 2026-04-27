import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, MessageCircle, Eye, ThumbsUp } from 'lucide-react';

function Analytics({ data }) {
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Views"
          value={data.totalViews || 0}
          icon={<Eye className="w-6 h-6" />}
          color="bg-blue-500"
          trend="+12%"
        />
        <MetricCard
          title="Active Users"
          value={data.activeUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="bg-purple-500"
          trend="+8%"
        />
        <MetricCard
          title="Total Posts"
          value={data.totalPosts || 0}
          icon={<MessageCircle className="w-6 h-6" />}
          color="bg-green-500"
          trend="+15%"
        />
        <MetricCard
          title="Engagement"
          value={`${data.engagementRate || 0}%`}
          icon={<ThumbsUp className="w-6 h-6" />}
          color="bg-yellow-500"
          trend="+5%"
        />
      </div>

      {/* Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.activityData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="comments" stroke="#8b5cf6" strokeWidth={2} />
            <Line type="monotone" dataKey="likes" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Posts by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoryData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {(data.categoryData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">User Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.engagementData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="interactions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Sentiment Analysis</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <SentimentCard sentiment="positive" count={data.positivePosts || 0} percentage={60} />
          <SentimentCard sentiment="neutral" count={data.neutralPosts || 0} percentage={30} />
          <SentimentCard sentiment="negative" count={data.negativePosts || 0} percentage={10} />
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Top Contributors</h3>
        <div className="space-y-3">
          {(data.topContributors || []).map((contributor, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-xl">
                  {contributor.avatar || '👤'}
                </div>
                <div>
                  <div className="font-medium">{contributor.name}</div>
                  <div className="text-sm text-gray-600">{contributor.posts} posts</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">{contributor.engagement} engagement</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, trend }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`${color} text-white p-3 rounded-lg`}>
          {icon}
        </div>
        <span className="text-green-600 text-sm font-medium">{trend}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}

function SentimentCard({ sentiment, count, percentage }) {
  const colors = {
    positive: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500' },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-500' },
    negative: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-500' }
  };

  const emojis = {
    positive: '😊',
    neutral: '😐',
    negative: '😞'
  };

  return (
    <div className={`${colors[sentiment].bg} p-6 rounded-lg border-l-4 ${colors[sentiment].border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{emojis[sentiment]}</span>
        <span className={`text-2xl font-bold ${colors[sentiment].text}`}>{count}</span>
      </div>
      <div className="capitalize text-gray-700 font-medium mb-2">{sentiment}</div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${colors[sentiment].border.replace('border', 'bg')}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

export default Analytics;