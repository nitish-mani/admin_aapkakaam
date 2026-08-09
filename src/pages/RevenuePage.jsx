// src/pages/RevenuePage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Store as StoreIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useQuery } from "react-query";
import { analyticsService } from "../services/analyticsService";
import { formatCurrency, formatNumber, formatDate } from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const RevenuePage = () => {
  const [period, setPeriod] = useState("month");
  const [chartTab, setChartTab] = useState(0);
  const [chartType, setChartType] = useState("line");

  const { data, isLoading, refetch } = useQuery(
    ["revenue", period],
    () => analyticsService.getRevenueAnalytics({ period }),
    { refetchOnWindowFocus: false },
  );

  const handleRefresh = () => {
    refetch();
    toast.success("Revenue data refreshed");
  };

  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportAnalytics({
        type: "revenue",
        format: "csv",
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      });

      const blob = new Blob([exportData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Revenue exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const revenueData = data?.data || {};
  const {
    timeline,
    totals,
    gatewayBreakdown,
    vendorRevenue,
    userRevenue,
    bookingTypeRevenue,
    patterns,
    metrics,
  } = revenueData;

  const COLORS = [
    "#3f51b5",
    "#f50057",
    "#ff9800",
    "#4caf50",
    "#2196f3",
    "#9c27b0",
    "#e91e63",
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, backgroundColor: "white", boxShadow: 3 }}>
          <Typography variant="caption" color="textSecondary">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" fontWeight={600}>
              {entry.name}:{" "}
              {entry.name === "Revenue" || entry.name === "revenue"
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
    <>
      <Helmet>
        <title>Revenue Analytics | Admin Panel</title>
      </Helmet>
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Revenue Analytics
          </Typography>
          <Box>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Revenue
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(totals?.totalRevenue || 0)}
              </Typography>
              {metrics?.monthlyChange !== undefined && (
                <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                  <Chip
                    icon={
                      metrics.monthlyChange >= 0 ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )
                    }
                    label={`${metrics.monthlyChange >= 0 ? "+" : ""}${metrics.monthlyChange.toFixed(1)}%`}
                    size="small"
                    color={metrics.monthlyChange >= 0 ? "success" : "error"}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="textSecondary">
                    vs last period
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Transactions
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatNumber(totals?.count || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Average Order Value
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(totals?.avgOrderValue || 0)}
              </Typography>
              {totals?.maxOrderValue > 0 && (
                <Typography variant="caption" color="textSecondary">
                  Max: {formatCurrency(totals.maxOrderValue)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Discounts
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(totals?.totalDiscounts || 0)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {totals?.totalRevenue > 0
                  ? `${((totals.totalDiscounts / (totals.totalRevenue + totals.totalDiscounts)) * 100).toFixed(1)}% of revenue`
                  : "0% of revenue"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Type Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" gap={1}>
            <Button
              variant={chartType === "line" ? "contained" : "outlined"}
              size="small"
              onClick={() => setChartType("line")}
            >
              Line Chart
            </Button>
            <Button
              variant={chartType === "area" ? "contained" : "outlined"}
              size="small"
              onClick={() => setChartType("area")}
            >
              Area Chart
            </Button>
            <Button
              variant={chartType === "bar" ? "contained" : "outlined"}
              size="small"
              onClick={() => setChartType("bar")}
            >
              Bar Chart
            </Button>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              label="Period"
            >
              <MenuItem value="day">Daily</MenuItem>
              <MenuItem value="week">Weekly</MenuItem>
              <MenuItem value="month">Monthly</MenuItem>
              <MenuItem value="year">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Main Chart */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Revenue Overview
        </Typography>
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" && (
              <LineChart
                data={timeline || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3f51b5"
                  strokeWidth={2}
                  name="Revenue"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="#4caf50"
                  strokeWidth={2}
                  name="Transactions"
                  dot={{ r: 4 }}
                />
              </LineChart>
            )}
            {chartType === "area" && (
              <AreaChart
                data={timeline || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3f51b5"
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="#4caf50"
                  fill="url(#colorCount)"
                  name="Transactions"
                />
              </AreaChart>
            )}
            {chartType === "bar" && (
              <BarChart
                data={timeline || []}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#3f51b5"
                  name="Revenue"
                />
                <Bar
                  yAxisId="right"
                  dataKey="count"
                  fill="#4caf50"
                  name="Transactions"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Breakdown Charts */}
      <Tabs value={chartTab} onChange={(e, v) => setChartTab(v)} sx={{ mb: 3 }}>
        <Tab label="Gateway" icon={<PaymentIcon />} iconPosition="start" />
        <Tab label="Vendors" icon={<StoreIcon />} iconPosition="start" />
        <Tab label="Users" icon={<PersonIcon />} iconPosition="start" />
        <Tab
          label="Booking Types"
          icon={<CategoryIcon />}
          iconPosition="start"
        />
      </Tabs>

      {chartTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Gateway Breakdown
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gatewayBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) =>
                        `${_id?.toUpperCase() || "Unknown"} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {(gatewayBreakdown || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Gateway Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Gateway</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Avg Order</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(gatewayBreakdown || []).map((gateway) => (
                      <TableRow key={gateway._id}>
                        <TableCell>
                          <Chip
                            label={gateway._id?.toUpperCase() || "Unknown"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(gateway.count)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(gateway.revenue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(gateway.avgOrderValue || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {chartTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Top Vendors by Revenue
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Transactions</TableCell>
                  <TableCell align="right">Avg Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(vendorRevenue || []).map((vendor) =>
                  vendor.vendorId ? (
                    <TableRow key={vendor.vendorId}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "secondary.main",
                            }}
                          >
                            {vendor.vendorName?.charAt(0).toUpperCase() || "V"}
                          </Avatar>
                          {vendor.vendorName?.toUpperCase() || "Unknown Vendor"}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(vendor.revenue)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(vendor.count)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(vendor.avgOrderValue || 0)}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ""
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {chartTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Top Users by Revenue
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Transactions</TableCell>
                  <TableCell align="right">Avg Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(userRevenue || []).map((user) =>
                  user.userId ? (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "primary.main",
                            }}
                          >
                            {user.userName?.charAt(0).toUpperCase() || "U"}
                          </Avatar>
                          {user.userName?.toUpperCase() || "Unknown User"}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(user.revenue)}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(user.count)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(user.avgOrderValue || 0)}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ""
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {chartTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue by Booking Type
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingTypeRevenue || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) =>
                        `${_id || "Other"} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {(bookingTypeRevenue || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Booking Type Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Discounts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(bookingTypeRevenue || []).map((type) => (
                      <TableRow key={type._id}>
                        <TableCell>
                          <Chip
                            label={type._id || "Other"}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(type.revenue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatNumber(type.count)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(type.discounts || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default RevenuePage;
