// src/pages/ReferralsPage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "react-query";
import { analyticsService } from "../services/analyticsService";
import { formatNumber, formatDate, getStatusColor } from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const ReferralsPage = () => {
  const [period, setPeriod] = useState("month");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tabValue, setTabValue] = useState(0);
  const [chartType, setChartType] = useState("line");
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    [
      "referrals",
      period,
      page,
      rowsPerPage,
      searchTerm,
      statusFilter,
      typeFilter,
    ],
    () =>
      analyticsService.getReferralAnalytics({
        period,
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  const handleRefresh = () => {
    refetch();
    toast.success("Referral data refreshed");
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  const handleTypeChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleViewReferral = (referral) => {
    setSelectedReferral(referral);
    setViewDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportAnalytics({
        type: "referrals",
        format: "csv",
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      });

      const blob = new Blob([exportData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `referrals_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Referrals exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const referralData = data?.data || {};
  const {
    timeline,
    totals,
    topUserReferrers,
    topVendorReferrers,
    typeDistribution,
    statusDistribution,
    conversionTrends,
    phoneTrends,
    referrals,
    pagination,
  } = referralData;

  const COLORS = [
    "#3f51b5",
    "#4caf50",
    "#f44336",
    "#ff9800",
    "#2196f3",
    "#9c27b0",
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          color: "success",
          icon: <CheckCircleIcon />,
        };
      case "pending":
        return { label: "Pending", color: "warning", icon: <PendingIcon /> };
      case "accepted":
        return { label: "Accepted", color: "info", icon: <HourglassIcon /> };
      case "rejected":
        return { label: "Rejected", color: "error", icon: <CancelIcon /> };
      default:
        return { label: status || "Unknown", color: "default", icon: null };
    }
  };

  const getReferrerTypeIcon = (type) => {
    switch (type) {
      case "User":
        return <PersonIcon fontSize="small" />;
      case "Vendor":
        return <StoreIcon fontSize="small" />;
      default:
        return <ShareIcon fontSize="small" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Referrals | Admin Panel</title>
      </Helmet>
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Referral Analytics
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
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Shares
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatNumber(totals?.total || 0)}
                  </Typography>
                </Box>
                <ShareIcon
                  sx={{ color: "#3f51b5", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Completed
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="success.main"
                  >
                    {formatNumber(totals?.completed || 0)}
                  </Typography>
                </Box>
                <CheckCircleIcon
                  sx={{ color: "#4caf50", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Completion Rate
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="warning.main"
                  >
                    {totals?.completionRate || 0}%
                  </Typography>
                </Box>
                <TrendingUpIcon
                  sx={{ color: "#ff9800", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Pending
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="warning.main"
                  >
                    {formatNumber(totals?.pending || 0)}
                  </Typography>
                </Box>
                <PendingIcon
                  sx={{ color: "#ff9800", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
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
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Referral Trends
        </Typography>
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" && (
              <LineChart data={timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3f51b5"
                  strokeWidth={2}
                  name="Total Shares"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#4caf50"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#ff9800"
                  strokeWidth={2}
                  name="Pending"
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#f44336"
                  strokeWidth={2}
                  name="Rejected"
                />
              </LineChart>
            )}
            {chartType === "area" && (
              <AreaChart data={timeline || []}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3f51b5"
                  fill="url(#colorTotal)"
                  name="Total Shares"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#4caf50"
                  fill="url(#colorCompleted)"
                  name="Completed"
                />
              </AreaChart>
            )}
            {chartType === "bar" && (
              <BarChart data={timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="total" fill="#3f51b5" name="Total Shares" />
                <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                <Bar dataKey="pending" fill="#ff9800" name="Pending" />
                <Bar dataKey="rejected" fill="#f44336" name="Rejected" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Breakdown Tabs */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Type Distribution" />
        <Tab label="Top Users" />
        <Tab label="Top Vendors" />
        <Tab label="Status" />
        <Tab label="Phone Trends" />
      </Tabs>

      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Referral Type Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) =>
                        `${type || "Unknown"} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(typeDistribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Type Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Completed</TableCell>
                      <TableCell align="right">Pending</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(typeDistribution || []).map((type) => (
                      <TableRow key={type.type}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getReferrerTypeIcon(type.type)}
                            <Chip
                              label={type.type || "Unknown"}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">{type.count}</TableCell>
                        <TableCell align="right">
                          {type.completed || 0}
                        </TableCell>
                        <TableCell align="right">{type.pending || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Top User Referrers
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Completed</TableCell>
                  <TableCell align="center">Pending</TableCell>
                  <TableCell align="center">Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(topUserReferrers || []).map((referrer) => {
                  const conversionRate =
                    referrer.total > 0
                      ? ((referrer.completed / referrer.total) * 100).toFixed(1)
                      : 0;
                  return (
                    <TableRow key={referrer.referrerId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "primary.main",
                            }}
                          >
                            {referrer.referrerName?.charAt(0) || "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {referrer.referrerName || "Unknown User"}
                            </Typography>
                            {referrer.referrerPhone && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                <PhoneIcon fontSize="inherit" />{" "}
                                {referrer.referrerPhone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{referrer.total}</TableCell>
                      <TableCell align="center">{referrer.completed}</TableCell>
                      <TableCell align="center">
                        {referrer.pending || 0}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(conversionRate, 100)}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {conversionRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Top Vendor Referrers
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Vendor</TableCell>
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">Completed</TableCell>
                  <TableCell align="center">Pending</TableCell>
                  <TableCell align="center">Conversion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(topVendorReferrers || []).map((referrer) => {
                  const conversionRate =
                    referrer.total > 0
                      ? ((referrer.completed / referrer.total) * 100).toFixed(1)
                      : 0;
                  return (
                    <TableRow key={referrer.referrerId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "secondary.main",
                            }}
                          >
                            {referrer.referrerName?.charAt(0) || "V"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {referrer.referrerName || "Unknown Vendor"}
                            </Typography>
                            {referrer.referrerPhone && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                <PhoneIcon fontSize="inherit" />{" "}
                                {referrer.referrerPhone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{referrer.total}</TableCell>
                      <TableCell align="center">{referrer.completed}</TableCell>
                      <TableCell align="center">
                        {referrer.pending || 0}
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(conversionRate, 100)}
                            sx={{ flex: 1, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="caption">
                            {conversionRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Status Distribution
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, percent }) =>
                        `${_id || "Unknown"} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(statusDistribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Status Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(statusDistribution || []).map((status) => {
                      const statusInfo = getStatusChip(status._id);
                      const percentage =
                        totals?.total > 0
                          ? ((status.count / totals.total) * 100).toFixed(1)
                          : 0;
                      return (
                        <TableRow key={status._id}>
                          <TableCell>
                            <Chip
                              label={statusInfo.label}
                              size="small"
                              color={statusInfo.color}
                              icon={statusInfo.icon}
                            />
                          </TableCell>
                          <TableCell align="right">{status.count}</TableCell>
                          <TableCell align="right">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 4 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Phone Number Trends (Referred Users)
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Phone Number</TableCell>
                  <TableCell align="center">Referral Count</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">First Share</TableCell>
                  <TableCell align="center">Last Share</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(phoneTrends || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">
                        No phone number trends available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  (phoneTrends || []).map((phone) => {
                    const statusInfo = getStatusChip(phone.status);
                    return (
                      <TableRow key={phone._id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <PhoneIcon color="action" />
                            <Typography variant="body2" fontWeight={500}>
                              {phone._id}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={phone.count}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            color={statusInfo.color}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(phone.firstShare)}
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(phone.lastShare)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Referrals List */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Referral List
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
          <TextField
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Referrer Type</InputLabel>
            <Select
              value={typeFilter}
              onChange={handleTypeChange}
              label="Referrer Type"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Vendor">Vendor</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ alignSelf: "center", ml: "auto" }}
          >
            Showing {referrals?.length || 0} of {pagination?.total || 0}{" "}
            referrals
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Referrer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Referred Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Share Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(referrals || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No referrals found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (referrals || []).map((referral) => {
                  const statusInfo = getStatusChip(referral.status);
                  const referrerName =
                    referral.userId?.name ||
                    referral.vendorId?.name ||
                    "Unknown";
                  const referrerType = referral.referrerType || "Unknown";
                  return (
                    <TableRow key={referral._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 12,
                              bgcolor:
                                referrerType === "User"
                                  ? "primary.main"
                                  : "secondary.main",
                            }}
                          >
                            {referrerName.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {referrerName?.toUpperCase()}
                            </Typography>
                            {referral.userId?.email && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {referral.userId.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={referrerType}
                          size="small"
                          variant="outlined"
                          icon={getReferrerTypeIcon(referrerType)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PhoneIcon fontSize="small" color="action" />
                          {referral.phoneNo || "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color}
                          icon={statusInfo.icon}
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(referral.shareDate || referral.createdAt)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewReferral(referral)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination?.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Referral Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <ShareIcon color="primary" />
            <Typography variant="h6">Referral Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedReferral && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      Referrer Information
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <Avatar sx={{ width: 40, height: 40 }}>
                        {(
                          selectedReferral.userId?.name ||
                          selectedReferral.vendorId?.name ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {selectedReferral.userId?.name?.toUpperCase() ||
                            selectedReferral.vendorId?.name?.toUpperCase() ||
                            "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Type: {selectedReferral.referrerType || "Unknown"}
                        </Typography>
                      </Box>
                    </Box>
                    {selectedReferral.userId?.email && (
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedReferral.userId.email}
                      </Typography>
                    )}
                    {selectedReferral.vendorId?.type && (
                      <Typography variant="body2">
                        <strong>Vendor Type:</strong>{" "}
                        {selectedReferral.vendorId.type}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="secondary"
                      gutterBottom
                    >
                      Referral Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Phone Number:</strong>{" "}
                      {selectedReferral.phoneNo || "N/A"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong>{" "}
                      <Chip
                        label={getStatusChip(selectedReferral.status).label}
                        size="small"
                        color={getStatusChip(selectedReferral.status).color}
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Share Date:</strong>{" "}
                      {formatDate(
                        selectedReferral.shareDate ||
                          selectedReferral.createdAt,
                        "long",
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReferralsPage;
