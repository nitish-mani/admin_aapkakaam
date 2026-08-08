import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const BookingChart = ({ bookings }) => {
  const data = [
    { name: "Active", value: bookings?.pending || 0 },
    { name: "Completed", value: bookings?.completed || 0 },
    { name: "Cancelled", value: bookings?.cancelled || 0 },
  ];

  const COLORS = ["#4caf50", "#2196f3", "#f44336"];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: "white" }}>
          <Typography variant="body2" fontWeight={600}>
            {payload[0].name}: {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Booking Status
      </Typography>
      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box display="flex" justifyContent="space-around" mt={2}>
        <Box textAlign="center">
          <Typography variant="h6" color="#4caf50">
            {data[0].value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Active
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" color="#2196f3">
            {data[1].value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Completed
          </Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="h6" color="#f44336">
            {data[2].value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Cancelled
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default BookingChart;
