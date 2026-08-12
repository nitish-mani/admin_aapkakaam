// src/pages/UsersPage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Money as MoneyIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import { analyticsService } from "../services/analyticsService";
import {
  formatDate,
  formatNumber,
  formatCurrency,
  getStatusColor,
} from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import {
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

const UsersPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  const { data, isLoading, refetch } = useQuery(
    ["users", page, rowsPerPage, searchTerm, statusFilter],
    () =>
      analyticsService.getUserAnalytics({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
      }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: userDetail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useQuery(
    ["userDetail", selectedUser],
    () =>
      selectedUser
        ? analyticsService.getUserDetailAnalytics(selectedUser)
        : null,
    {
      enabled: !!selectedUser,
      refetchOnWindowFocus: false,
    },
  );

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
  const handleRefresh = () => {
    refetch();
    toast.success("Users data refreshed");
  };

  const handleViewUser = (userId) => {
    setSelectedUser(userId);
    setViewDialogOpen(true);
    refetchDetail();
  };

  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportAnalytics({
        type: "users",
        format: "csv",
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      });

      const blob = new Blob([exportData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Users exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  // Extract data from response
  const users = data?.data?.users || [];
  const totals = data?.data?.totals || { total: 0, active: 0, blocked: 0 };
  const engagement = data?.data?.engagement || {
    avgBookings: 0,
    avgTransactions: 0,
    avgShares: 0,
    avgBalance: 0,
    totalBalance: 0,
    avgEarning: 0,
    totalEarnings: 0,
    bookingStats: {
      avgPending: 0,
      avgCompleted: 0,
      avgCanceled: 0,
    },
    shareStats: {
      avgPendingShareBy: 0,
      avgCompletedShareBy: 0,
      avgCanceledShareBy: 0,
      totalPendingShareBy: 0,
      totalCompletedShareBy: 0,
      totalCanceledShareBy: 0,
    },
  };
  const pagination = data?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };
  const genderDistribution = data?.data?.genderDistribution || [];

  const COLORS = ["#3f51b5", "#f50057", "#4caf50", "#ff9800", "#2196f3"];

  return (
    <>
      <Helmet>
        <title>Users | Admin Panel</title>
      </Helmet>

      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Users Management
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Users
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatNumber(totals.total || 0)}
                  </Typography>
                </Box>
                <PeopleIcon
                  sx={{ color: "#3f51b5", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Active Users
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="success.main"
                  >
                    {formatNumber(totals.active || 0)}
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Blocked Users
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">
                    {formatNumber(totals.blocked || 0)}
                  </Typography>
                </Box>
                <BlockIcon
                  sx={{ color: "#f44336", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography color="textSecondary" variant="caption">
                    Total Earnings
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(engagement.totalEarnings || 0)}
                  </Typography>
                </Box>
                <MoneyIcon
                  sx={{ color: "#4caf50", fontSize: 40, opacity: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Engagement Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="textSecondary">
              Avg Bookings
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {engagement.avgBookings?.toFixed(1) || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="textSecondary">
              Avg Transactions
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {engagement.avgTransactions?.toFixed(1) || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="textSecondary">
              Avg Shares
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {engagement.avgShares?.toFixed(1) || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="caption" color="textSecondary">
              Avg Earnings
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {formatCurrency(engagement.avgEarning || 0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Gender Distribution Chart */}
      {genderDistribution.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Gender Distribution
          </Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderDistribution}
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
                  {genderDistribution.map((entry, index) => (
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
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          {/* <TextField
            placeholder="Search users by name, email, phone..."
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
          /> */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ alignSelf: "center", ml: "auto" }}
          >
            Showing {users.length} of {pagination.total || 0} users
          </Typography>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Shares</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                          }}
                        >
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </Avatar>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name.toUpperCase() || "Unknown"}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{user.phoneNo || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || "Active"}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(
                            user.status || "active",
                          ),
                          color: "white",
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {user.bookingCount || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ✓{user.completed || 0} ✗{user.canceled || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {user.shareCount || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ✓{user.completedShareBy || 0} ✗
                          {user.canceledShareBy || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(user.earning.toFixed(2) || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(user.balance.toFixed(2) || 0)}
                    </TableCell>
                    <TableCell>{formatDate(user.accountCreatedOn)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewUser(user._id)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* User Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <PersonIcon color="primary" />
            <Typography variant="h6">User Details</Typography>
            {userDetail?.data?.user && (
              <Chip
                label={userDetail.data.user.status || "Active"}
                size="small"
                color={
                  userDetail.data.user.status === "active" ? "success" : "error"
                }
                sx={{ ml: "auto" }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <LoadingSpinner />
          ) : userDetail?.data ? (
            <Box>
              {/* User Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
                    >
                      {userDetail.data.user?.name?.charAt(0).toUpperCase() ||
                        "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {userDetail.data.user?.name.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {userDetail.data.user?.phoneNo || "No phone"}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                        <Chip
                          label={
                            userDetail.data.user?.gender || "Not specified"
                          }
                          size="small"
                          variant="outlined"
                        />
                        {userDetail.data.user?.pincode && (
                          <Chip
                            icon={<LocationIcon />}
                            label={`Pincode: ${userDetail.data.user.pincode}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          icon={<MoneyIcon />}
                          label={`Balance: ${formatCurrency(userDetail.data.user?.balance || 0)}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<TrendingUpIcon />}
                          label={`Earnings: ${formatCurrency(userDetail.data.user?.earning || 0)}`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Tabs
                value={detailTab}
                onChange={(e, v) => setDetailTab(v)}
                sx={{ mb: 2 }}
              >
                <Tab label="Overview" />
                <Tab label="Bookings" />
                <Tab label="Transactions" />
                <Tab label="Stats" />
              </Tabs>

              {detailTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="caption">
                          Total Bookings
                        </Typography>
                        <Typography variant="h6">
                          {formatNumber(userDetail.data.bookings?.total || 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="caption">
                          Completed
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatNumber(
                            userDetail.data.bookings?.completed || 0,
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="caption">
                          Active
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {formatNumber(userDetail.data.bookings?.active || 0)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="caption">
                          Cancelled
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatNumber(
                            userDetail.data.bookings?.cancelled || 0,
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="caption">
                          Total Spent
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(
                            userDetail.data.transactions?.totalSpent || 0,
                          )}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatNumber(
                            userDetail.data.transactions?.transactionCount || 0,
                          )}{" "}
                          transactions
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {detailTab === 1 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Booking Timeline
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userDetail.data.bookings?.timeline || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3f51b5" name="Total" />
                        <Bar
                          dataKey="completed"
                          fill="#4caf50"
                          name="Completed"
                        />
                        <Bar
                          dataKey="cancelled"
                          fill="#f44336"
                          name="Cancelled"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  {userDetail.data.bookingByType?.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        Booking by Type
                      </Typography>
                      <Grid container spacing={1}>
                        {userDetail.data.bookingByType.map((type, idx) => (
                          <Grid item xs={4} key={idx}>
                            <Paper
                              sx={{
                                p: 1,
                                textAlign: "center",
                                bgcolor: "#e3f2fd",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {type._id.toUpperCase() || "Other"}
                              </Typography>
                              <Typography variant="h6">{type.count}</Typography>
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                ✓{type.completed || 0}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  {userDetail.data.bookings?.byVendor?.length > 0 && (
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        Top Vendors
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Vendor</TableCell>
                              <TableCell align="right">Total</TableCell>
                              <TableCell align="right">Completed</TableCell>
                              <TableCell align="right">Spent</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {userDetail.data.bookings.byVendor.map(
                              (vendor, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    {vendor.vendorName.toUpperCase() ||
                                      "Unknown Vendor"}
                                  </TableCell>
                                  <TableCell align="right">
                                    {vendor.count}
                                  </TableCell>
                                  <TableCell align="right">
                                    {vendor.completed}
                                  </TableCell>
                                  <TableCell align="right">
                                    {formatCurrency(vendor.totalSpent || 0)}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}

              {detailTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="caption">
                            Total Spent
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              userDetail.data.transactions?.totalSpent || 0,
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="caption">
                            Avg Order Value
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              userDetail.data.transactions?.avgOrderValue || 0,
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="caption">
                            Total Discounts
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              userDetail.data.transactions?.totalDiscounts || 0,
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="caption">
                            Referrals
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(
                              userDetail.data.referrals?.total || 0,
                            )}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {userDetail.data.referrals?.completed || 0}{" "}
                            completed
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {detailTab === 3 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Complete User Stats
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          gutterBottom
                        >
                          Booking Stats
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Total
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                userDetail.data.user?.bookingCount || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Completed
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatNumber(
                                userDetail.data.user?.bookingStats?.completed ||
                                  0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Canceled
                            </Typography>
                            <Typography variant="body1" color="error.main">
                              {formatNumber(
                                userDetail.data.user?.bookingStats?.canceled ||
                                  0,
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="secondary"
                          gutterBottom
                        >
                          Share Stats
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Total Shares
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                userDetail.data.user?.shareCount || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Completed
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatNumber(
                                userDetail.data.user?.shareStats
                                  ?.completedShareBy || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Canceled
                            </Typography>
                            <Typography variant="body1" color="error.main">
                              {formatNumber(
                                userDetail.data.user?.shareStats
                                  ?.canceledShareBy || 0,
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="warning"
                          gutterBottom
                        >
                          Financial Summary
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Earnings
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatCurrency(
                                userDetail.data.user?.earning || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Balance
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                userDetail.data.user?.balance || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Transactions
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                userDetail.data.user?.transactionCount || 0,
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          ) : (
            <Typography color="error">Failed to load user details</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersPage;
