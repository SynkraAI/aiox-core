import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import './Chart.css';

const STATUS_COLORS = {
  healthy: '#22c55e',
  degraded: '#eab308',
  warning: '#f97316',
  critical: '#ef4444'
};

/**
 * Get color based on score value
 */
function getScoreColor(score) {
  if (score >= 90) return STATUS_COLORS.healthy;
  if (score >= 70) return STATUS_COLORS.degraded;
  if (score >= 50) return STATUS_COLORS.warning;
  return STATUS_COLORS.critical;
}

/**
 * Trend chart component for health score history
 */
function TrendChart({ data, height = 200, showArea = true }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <p>No historical data available</p>
      </div>
    );
  }

  // Add color to each data point
  const chartData = data.map(point => ({
    ...point,
    color: getScoreColor(point.score)
  }));

  const latestScore = chartData[chartData.length - 1]?.score || 0;
  const strokeColor = getScoreColor(latestScore);

  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {showArea ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value) => [`${value}%`, 'Score']}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={strokeColor}
              fill="url(#scoreGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value) => [`${value}%`, 'Score']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ fill: strokeColor, strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default TrendChart;
