import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "../../utils/formatters";

const RevenueChart = ({ revenue }) => {
  const data = revenue?.timeline || [
    { _id: "Jan", revenue: 50000, count: 45 },
    { _id: "Feb", revenue: 75000, count: 60 },
    { _id: "Mar", revenue: 60000, count: 50 },
    { _id: "Apr", revenue: 90000, count: 70 },
    { _id: "May", revenue: 120000, count: 85 },
    { _id: "Jun", revenue: 100000, count: 75 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: "white" }}>
          <Typography variant="caption" color="textSecondary">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" fontWeight={600}>
              {entry.name}:{" "}
              {entry.name === "Revenue"
                ? formatCurrency(entry.value)
                : entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Revenue Overview
      </Typography>
      <Box sx={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize: 12 }} tickLine={false} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3f51b5"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4caf50"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default RevenueChart;
