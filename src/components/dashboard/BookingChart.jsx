import React from "react";
import { Paper, Typography, Box, useMediaQuery, useTheme } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const BookingChart = ({ bookings }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const data = [
    { name: "Active", value: bookings?.pending || 0 },
    { name: "Completed", value: bookings?.completed || 0 },
    { name: "Canceled", value: bookings?.canceled || 0 },
  ];

  const COLORS = ["#4caf50", "#2196f3", "#f44336"];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percentage =
        total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <Paper sx={{ p: 1.5, backgroundColor: "white", boxShadow: 3 }}>
          <Typography variant="body2" fontWeight={600}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2">
            Count: <strong>{payload[0].value}</strong>
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {percentage}% of total
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const chartHeight = isMobile ? 250 : isTablet ? 300 : 350;
  const outerRadius = isMobile ? 70 : isTablet ? 80 : 90;
  const innerRadius = isMobile ? 25 : 35;

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 3 }, height: "100%" }}>
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        fontWeight={600}
        gutterBottom
      >
        Booking Status
      </Typography>

      <Box sx={{ height: chartHeight, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              layout="horizontal"
              wrapperStyle={{
                fontSize: isMobile ? 10 : 12,
                paddingTop: isMobile ? 2 : 5,
              }}
              iconType="circle"
              iconSize={isMobile ? 8 : 10}
              payload={data.map((item, index) => ({
                value: `${item.name} (${item.value})`,
                type: "circle",
                color: COLORS[index],
              }))}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default BookingChart;
