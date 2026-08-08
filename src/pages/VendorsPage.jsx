// src/pages/VendorsPage.jsx
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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Money as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import { analyticsService } from "../services/analyticsService";
import {
  formatCurrency,
  formatNumber,
  formatDate,
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

const VendorsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  const { data, isLoading, refetch } = useQuery(
    [
      "vendors",
      page,
      rowsPerPage,
      searchTerm,
      statusFilter,
      typeFilter,
      sortBy,
    ],
    () =>
      analyticsService.getVendorAnalytics({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        sortBy: sortBy,
      }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  const {
    data: vendorDetail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useQuery(
    ["vendorDetail", selectedVendor],
    () =>
      selectedVendor
        ? analyticsService.getVendorDetailAnalytics(selectedVendor)
        : null,
    {
      enabled: !!selectedVendor,
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
  const handleTypeChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(0);
  };
  const handleRefresh = () => {
    refetch();
    toast.success("Vendor data refreshed");
  };

  const handleViewVendor = (vendorId) => {
    setSelectedVendor(vendorId);
    setViewDialogOpen(true);
    refetchDetail();
  };

  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportAnalytics({
        type: "vendors",
        format: "csv",
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      });

      const blob = new Blob([exportData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vendors_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Vendors exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const vendors = data?.data?.vendors || data?.data?.topVendors || [];
  const totalCount = data?.data?.totals?.total || 0;
  const typeDistribution = data?.data?.typeDistribution || [];
  const performance = data?.data?.performance || {};
  const pincodeDistribution = data?.data?.pincodeDistribution || [];

  const COLORS = [
    "#3f51b5",
    "#f50057",
    "#ff9800",
    "#4caf50",
    "#2196f3",
    "#9c27b0",
  ];

  const getBookingStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon fontSize="small" />;
      case "pending":
        return <PendingIcon fontSize="small" />;
      case "canceled":
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Vendors | Admin Panel</title>
      </Helmet>
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Vendor Analytics
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
                Total Vendors
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatNumber(data?.data?.totals?.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Active Vendors
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {formatNumber(data?.data?.totals?.active || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Avg Rating
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {performance?.avgRating?.toFixed(1) || 0} ★
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Earnings
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(performance?.totalEarnings || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Vendor Type Distribution
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }) =>
                      `${_id?.toUpperCase() || "Other"} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {typeDistribution.map((entry, index) => (
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
              Vendor Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#e3f2fd"
                  borderRadius={2}
                >
                  <Typography variant="h5" color="primary">
                    {formatCurrency(performance?.totalEarnings || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Earnings
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#e8f5e9"
                  borderRadius={2}
                >
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(performance?.totalCommission || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Commission
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#fff3e0"
                  borderRadius={2}
                >
                  <Typography variant="h5" color="warning.main">
                    {formatNumber(performance?.bookingStats?.total || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Bookings
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#fce4ec"
                  borderRadius={2}
                >
                  <Typography variant="h5" color="error.main">
                    {formatCurrency(performance?.totalBalance || 0)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Balance
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Additional Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Booking Stats Breakdown
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box
                  textAlign="center"
                  p={1}
                  bgcolor="#e8f5e9"
                  borderRadius={2}
                >
                  <Typography variant="caption" color="textSecondary">
                    Completed
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatNumber(performance?.bookingStats?.completed || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box
                  textAlign="center"
                  p={1}
                  bgcolor="#fff3e0"
                  borderRadius={2}
                >
                  <Typography variant="caption" color="textSecondary">
                    Pending
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatNumber(performance?.bookingStats?.pending || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box
                  textAlign="center"
                  p={1}
                  bgcolor="#fce4ec"
                  borderRadius={2}
                >
                  <Typography variant="caption" color="textSecondary">
                    Canceled
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {formatNumber(performance?.bookingStats?.canceled || 0)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Vendor-Facing Bookings
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Completed
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {formatNumber(
                        performance?.bookingStats?.completedVendor || 0,
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Pending
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      {formatNumber(
                        performance?.bookingStats?.pendingVendor || 0,
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Canceled
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      {formatNumber(
                        performance?.bookingStats?.canceledVendor || 0,
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Share Stats
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Completed
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      {formatNumber(
                        performance?.bookingStats?.completedShareBy || 0,
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Pending
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      {formatNumber(
                        performance?.bookingStats?.pendingShareBy || 0,
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Canceled
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      {formatNumber(
                        performance?.bookingStats?.canceledShareBy || 0,
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Top Pincodes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pincode</TableCell>
                    <TableCell align="right">Vendors</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pincodeDistribution.slice(0, 5).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationIcon fontSize="small" color="action" />
                          {item._id || "N/A"}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={item.count}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search vendors by name, email, phone, pincode..."
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={handleTypeChange} label="Type">
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="plumber">Plumber</MenuItem>
              <MenuItem value="electrician">Electrician</MenuItem>
              <MenuItem value="carpenter">Carpenter</MenuItem>
              <MenuItem value="painter">Painter</MenuItem>
              <MenuItem value="cleaner">Cleaner</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label="Sort By">
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="earnings">Earnings</MenuItem>
              <MenuItem value="bookings">Bookings</MenuItem>
              <MenuItem value="commission">Commission</MenuItem>
              <MenuItem value="balance">Balance</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ alignSelf: "center", ml: "auto" }}
          >
            Showing {vendors.length} of {totalCount} vendors
          </Typography>
        </Box>
      </Paper>

      {/* Vendors Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Vendor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Bookings</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Shares</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No vendors found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "secondary.main",
                          }}
                        >
                          {vendor.name?.charAt(0).toUpperCase() || "V"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {vendor.name.toUpperCase() || "Unknown"}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {vendor.email || "No email"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vendor.type.toUpperCase() || "General"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={vendor.status || "Active"}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(
                            vendor.status || "active",
                          ),
                          color: "white",
                          fontWeight: 500,
                        }}
                      />
                      {vendor.isVerified && (
                        <Chip
                          label="Verified"
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <StarIcon sx={{ fontSize: 16, color: "#ff9800" }} />
                        <Typography variant="body2">
                          {(vendor.rating || 0).toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({vendor.ratingCount || 0})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(vendor.earning || 0)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatNumber(vendor.bookingCount || 0)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ✓{vendor.completed || 0} ✗{vendor.canceled || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatCurrency(vendor.balance || 0)}</TableCell>
                    <TableCell>
                      <Chip
                        label={formatNumber(vendor.shareCount || 0)}
                        size="small"
                        variant="outlined"
                        icon={<ShareIcon fontSize="small" />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewVendor(vendor._id)}
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Vendor Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <StoreIcon color="primary" />
            <Typography variant="h6">Vendor Details</Typography>
            {vendorDetail?.data?.vendor && (
              <Chip
                label={vendorDetail.data.vendor.status || "Active"}
                size="small"
                color={
                  vendorDetail.data.vendor.status === "active"
                    ? "success"
                    : "error"
                }
                sx={{ ml: "auto" }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <LoadingSpinner />
          ) : vendorDetail?.data ? (
            <Box>
              {/* Vendor Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{ width: 56, height: 56, bgcolor: "secondary.main" }}
                    >
                      {vendorDetail.data.vendor?.name
                        ?.charAt(0)
                        .toUpperCase() || "V"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {vendorDetail.data.vendor?.name.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {vendorDetail.data.vendor?.email || "No email"} •{" "}
                        {vendorDetail.data.vendor?.phoneNo || "No phone"}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                        <Chip
                          label={
                            vendorDetail.data.vendor?.type.toUpperCase() ||
                            "General"
                          }
                          size="small"
                          variant="outlined"
                        />
                        {vendorDetail.data.vendor?.isVerified && (
                          <Chip label="Verified" size="small" color="success" />
                        )}
                        <Chip
                          icon={<StarIcon />}
                          label={`${vendorDetail.data.vendor?.rating?.toFixed(1) || 0} ★ (${vendorDetail.data.vendor?.ratingCount || 0} reviews)`}
                          size="small"
                          variant="outlined"
                        />
                        {vendorDetail.data.vendor?.pincode && (
                          <Chip
                            icon={<LocationIcon />}
                            label={`Pincode: ${vendorDetail.data.vendor.pincode}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
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
                <Tab label="Revenue" />
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
                          {formatNumber(vendorDetail.data.bookings?.total || 0)}
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
                            vendorDetail.data.bookings?.completed || 0,
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
                          {formatNumber(
                            vendorDetail.data.bookings?.active || 0,
                          )}
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
                            vendorDetail.data.bookings?.cancelled || 0,
                          )}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" variant="caption">
                          Total Revenue
                        </Typography>
                        <Typography variant="h5">
                          {formatCurrency(
                            vendorDetail.data.revenue?.totalRevenue || 0,
                          )}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatNumber(
                            vendorDetail.data.revenue?.transactionCount || 0,
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
                      <BarChart
                        data={vendorDetail.data.bookings?.timeline || []}
                      >
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
                  <Box mt={2}>
                    <Typography variant="subtitle2" gutterBottom>
                      Booking Distribution
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#e3f2fd" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            By User
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(
                              vendorDetail.data.bookings?.byUser || 0,
                            )}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#f3e5f5" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            By Vendor
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(
                              vendorDetail.data.bookings?.byVendor || 0,
                            )}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={4}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#e8f5e9" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            Rating
                          </Typography>
                          <Typography variant="h6">
                            {vendorDetail.data.vendor?.rating?.toFixed(1) || 0}{" "}
                            ★
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}

              {detailTab === 2 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Revenue Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>
                          <Typography color="textSecondary" variant="caption">
                            Total Revenue
                          </Typography>
                          <Typography variant="h6">
                            {formatCurrency(
                              vendorDetail.data.revenue?.totalRevenue || 0,
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
                              vendorDetail.data.revenue?.avgOrderValue || 0,
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
                              vendorDetail.data.revenue?.totalDiscounts || 0,
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
                              vendorDetail.data.referrals?.total || 0,
                            )}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {vendorDetail.data.referrals?.completed || 0}{" "}
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
                    Complete Booking Stats
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          gutterBottom
                        >
                          User-Facing Bookings
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Total
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
                                  ?.bookingCount || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Completed
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
                                  ?.completed || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Canceled
                            </Typography>
                            <Typography variant="body1" color="error.main">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
                                  ?.canceled || 0,
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
                          Vendor-Facing Bookings
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Total
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
                                  ?.bookingCountVendor || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Completed
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
                                  ?.completedVendor || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Canceled
                            </Typography>
                            <Typography variant="body1" color="error.main">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
                                  ?.canceledVendor || 0,
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
                          Share Stats
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Total
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                vendorDetail.data.vendor?.shareCount || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Completed
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatNumber(
                                vendorDetail.data.vendor?.bookingStats
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
                                vendorDetail.data.vendor?.bookingStats
                                  ?.canceledShareBy || 0,
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Financial Summary
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Earnings
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                vendorDetail.data.vendor?.earning || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Commission
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                vendorDetail.data.vendor?.commission || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Balance
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                vendorDetail.data.vendor?.balance || 0,
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
            <Typography color="error">Failed to load vendor details</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VendorsPage;
