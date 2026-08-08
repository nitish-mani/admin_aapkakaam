// src/pages/BookingsPage.jsx
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
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Rating,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Bookmark as BookmarkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useQuery } from "react-query";
import { analyticsService } from "../services/analyticsService";
import {
  formatDate,
  formatCurrency,
  formatNumber,
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

const BookingsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ["bookings", page, rowsPerPage, searchTerm, statusFilter],
    () =>
      analyticsService.getBookingAnalytics({
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
    data: bookingDetail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useQuery(
    ["bookingDetail", selectedBooking],
    () =>
      selectedBooking
        ? analyticsService.getBookingDetailAnalytics(selectedBooking)
        : null,
    {
      enabled: !!selectedBooking,
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
    toast.success("Bookings data refreshed");
  };

  const handleViewBooking = (bookingId) => {
    setSelectedBooking(bookingId);
    setViewDialogOpen(true);
    refetchDetail();
  };

  const handleExport = async () => {
    try {
      const exportData = await analyticsService.exportAnalytics({
        type: "bookings",
        format: "csv",
        from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      });

      const blob = new Blob([exportData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookings_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Bookings exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const bookings = data?.data?.bookings || [];
  const totals = data?.data?.totals || {
    total: 0,
    completed: 0,
    cancelled: 0,
    active: 0,
  };
  const pagination = data?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };
  const timeline = data?.data?.timeline || [];
  const typeDistribution = data?.data?.typeDistribution || [];
  const topVendors = data?.data?.topVendors || [];
  const topUsers = data?.data?.topUsers || [];
  const bookingByDistribution = data?.data?.bookingByDistribution || [];
  const pincodeDistribution = data?.data?.pincodeDistribution || [];
  console.log(timeline);
  const COLORS = [
    "#3f51b5",
    "#4caf50",
    "#f44336",
    "#ff9800",
    "#2196f3",
    "#9c27b0",
  ];

  const getStatusChip = (booking) => {
    if (booking.orderCompleted) return { label: "Completed", color: "success" };
    if (booking.cancelOrder) return { label: "Cancelled", color: "error" };
    return { label: "Active", color: "warning" };
  };

  return (
    <>
      <Helmet>
        <title>Bookings | Admin Panel</title>
      </Helmet>
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Bookings Management
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
                Total Bookings
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatNumber(totals.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Completed
              </Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {formatNumber(totals.completed || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Active
              </Typography>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {formatNumber(totals.active || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Cancelled
              </Typography>
              <Typography variant="h5" fontWeight={700} color="error.main">
                {formatNumber(totals.cancelled || 0)}
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
              Booking Timeline
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3f51b5" name="Total" />
                  <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                  <Bar dataKey="cancelled" fill="#f44336" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Booking Type Distribution
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
                      `${_id.toUpperCase() || "Other"} ${(percent * 100).toFixed(0)}%`
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
              Booking By (User/Vendor)
            </Typography>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingByDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percent }) =>
                      `${_id || "Other"} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {bookingByDistribution.map((entry, index) => (
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
              Top Pincodes
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pincode</TableCell>
                    <TableCell align="right">Bookings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pincodeDistribution.slice(0, 5).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>{item._id || "N/A"}</TableCell>
                      <TableCell align="right">{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Vendors & Users */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Top Vendors
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vendor</TableCell>
                    <TableCell align="right">Bookings</TableCell>
                    <TableCell align="right">Completed</TableCell>
                    <TableCell align="right">Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topVendors.slice(0, 5).map((vendor) => (
                    <TableRow key={vendor.vendorId}>
                      <TableCell>
                        {vendor.vendorName.toUpperCase() || "Unknown"}
                      </TableCell>
                      <TableCell align="right">{vendor.count}</TableCell>
                      <TableCell align="right">
                        {vendor.completed || 0}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(vendor.totalExpenseVendor || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Top Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell align="right">Bookings</TableCell>
                    <TableCell align="right">Completed</TableCell>
                    <TableCell align="right">Spent</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topUsers.slice(0, 5).map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        {user.userName.toUpperCase() || "Unknown"}
                      </TableCell>
                      <TableCell align="right">{user.count}</TableCell>
                      <TableCell align="right">{user.completed || 0}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(user.totalExpenseUser || 0)}
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
            placeholder="Search bookings by name, village, post, district, pincode..."
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
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ alignSelf: "center", ml: "auto" }}
          >
            Showing {bookings.length} of {pagination.total || 0} bookings
          </Typography>
        </Box>
      </Paper>

      {/* Bookings Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No bookings found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => {
                  const status = getStatusChip(booking);
                  return (
                    <TableRow key={booking._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          #{booking._id?.slice(-8) || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {booking.userId?.name?.charAt(0).toUpperCase() ||
                              booking.name?.charAt(0).toUpperCase() ||
                              "U"}
                          </Avatar>
                          <Typography variant="body2">
                            {booking.userId?.name.toUpperCase() ||
                              booking.name ||
                              "Unknown"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {booking.vendorId?.name.toUpperCase() || "Unknown"}
                      </TableCell>
                      <TableCell>{formatDate(booking.bookingDate)}</TableCell>
                      <TableCell>
                        <Chip
                          label={status.label}
                          size="small"
                          color={status.color}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.type.toUpperCase() || "General"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        ₹{booking.expenseUser || booking.expenseVendor || 0}
                      </TableCell>
                      <TableCell>
                        {booking.rating > 0 ? (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <StarIcon sx={{ fontSize: 16, color: "#ff9800" }} />
                            <Typography variant="body2">
                              {booking.rating.toFixed(1)}
                            </Typography>
                          </Box>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewBooking(booking._id)}
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
          count={pagination.total || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Booking Detail Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <BookmarkIcon color="primary" />
            <Typography variant="h6">Booking Details</Typography>
            {bookingDetail?.data?.booking && (
              <Chip
                label={
                  bookingDetail.data.booking.orderCompleted
                    ? "Completed"
                    : bookingDetail.data.booking.cancelOrder
                      ? "Cancelled"
                      : "Active"
                }
                size="small"
                color={
                  bookingDetail.data.booking.orderCompleted
                    ? "success"
                    : bookingDetail.data.booking.cancelOrder
                      ? "error"
                      : "warning"
                }
                sx={{ ml: "auto" }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <LoadingSpinner />
          ) : bookingDetail?.data ? (
            <Box>
              {/* Booking Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 2,
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Booking Date
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(
                            bookingDetail.data.booking?.bookingDate,
                            "long",
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Booking Time
                        </Typography>
                        <Typography variant="body2">
                          {bookingDetail.data.booking?.bookingTime || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Booked On
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(
                            bookingDetail.data.booking?.bookedOn,
                            "long",
                          )}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Booking By
                        </Typography>
                        <Typography variant="body2">
                          {bookingDetail.data.booking?.bookingBy || "N/A"}
                        </Typography>
                      </Grid>
                      {bookingDetail.data.booking?.pincode && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="textSecondary">
                            Pincode
                          </Typography>
                          <Typography variant="body2">
                            {bookingDetail.data.booking.pincode}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* User & Vendor Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      <PersonIcon
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      User Details
                    </Typography>
                    {bookingDetail.data.user ? (
                      <Box>
                        <Typography variant="body2">
                          <strong>Name:</strong>{" "}
                          {bookingDetail.data.user.name.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong>{" "}
                          {bookingDetail.data.user.email || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong>{" "}
                          {bookingDetail.data.user.phoneNo || "N/A"}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="body2">
                          <strong>Name:</strong>{" "}
                          {bookingDetail.data.booking?.name.toUpperCase() ||
                            "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong>{" "}
                          {bookingDetail.data.booking?.phoneNo || "N/A"}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      color="secondary"
                      gutterBottom
                    >
                      <StoreIcon
                        fontSize="small"
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Vendor Details
                    </Typography>
                    {bookingDetail.data.vendor ? (
                      <Box>
                        <Typography variant="body2">
                          <strong>Name:</strong>{" "}
                          {bookingDetail.data.vendor.name.toUpperCase()}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Email:</strong>{" "}
                          {bookingDetail.data.vendor.email || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Phone:</strong>{" "}
                          {bookingDetail.data.vendor.phoneNo || "N/A"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Rating:</strong>{" "}
                          {bookingDetail.data.vendor.rating?.toFixed(1) ||
                            "N/A"}{" "}
                          ★
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Vendor information not available
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Location & Address */}
              {(bookingDetail.data.booking?.vill ||
                bookingDetail.data.booking?.post ||
                bookingDetail.data.booking?.dist) && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    <LocationIcon
                      fontSize="small"
                      sx={{ mr: 1, verticalAlign: "middle" }}
                    />
                    Location Details
                  </Typography>
                  <Grid container spacing={1}>
                    {bookingDetail.data.booking?.vill && (
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Village
                        </Typography>
                        <Typography variant="body2">
                          {bookingDetail.data.booking.vill}
                        </Typography>
                      </Grid>
                    )}
                    {bookingDetail.data.booking?.post && (
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Post
                        </Typography>
                        <Typography variant="body2">
                          {bookingDetail.data.booking.post}
                        </Typography>
                      </Grid>
                    )}
                    {bookingDetail.data.booking?.dist && (
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          District
                        </Typography>
                        <Typography variant="body2">
                          {bookingDetail.data.booking.dist}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              )}

              {/* Financial Details */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <TrendingUpIcon
                    fontSize="small"
                    sx={{ mr: 1, verticalAlign: "middle" }}
                  />
                  Financial Details
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      User Expense
                    </Typography>
                    <Typography variant="body2">
                      ₹{bookingDetail.data.booking?.expenseUser || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Vendor Expense
                    </Typography>
                    <Typography variant="body2">
                      ₹{bookingDetail.data.booking?.expenseVendor || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="textSecondary">
                      Total
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      ₹
                      {(bookingDetail.data.booking?.expenseUser || 0) +
                        (bookingDetail.data.booking?.expenseVendor || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Review & Rating */}
              {(bookingDetail.data.booking?.review ||
                bookingDetail.data.booking?.rating > 0) && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Review & Rating
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Rating
                      value={bookingDetail.data.booking?.rating || 0}
                      readOnly
                      precision={0.5}
                    />
                    <Typography variant="body2">
                      {bookingDetail.data.booking?.rating?.toFixed(1) ||
                        "No rating"}
                    </Typography>
                    {bookingDetail.data.booking?.reviewedOn && (
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(
                          bookingDetail.data.booking.reviewedOn,
                          "short",
                        )}
                      </Typography>
                    )}
                  </Box>
                  {bookingDetail.data.booking?.review && (
                    <Typography variant="body2" color="textSecondary">
                      "{bookingDetail.data.booking.review}"
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Similar Bookings */}
              {bookingDetail.data.similarBookings?.total > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Similar Bookings
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="textSecondary">
                        Total
                      </Typography>
                      <Typography variant="body2">
                        {bookingDetail.data.similarBookings.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="textSecondary">
                        Completed
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {bookingDetail.data.similarBookings.completed}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="textSecondary">
                        Cancelled
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {bookingDetail.data.similarBookings.cancelled}
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="caption" color="textSecondary">
                        Avg Rating
                      </Typography>
                      <Typography variant="body2">
                        {bookingDetail.data.similarBookings.avgRating?.toFixed(
                          1,
                        ) || "N/A"}{" "}
                        ★
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* User History */}
              {bookingDetail.data.userHistory?.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    User Booking History
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Vendor</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bookingDetail.data.userHistory
                          .slice(0, 5)
                          .map((history, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {formatDate(history.bookingDate)}
                              </TableCell>
                              <TableCell>
                                {history.vendorId?.name.toUpperCase() ||
                                  "Unknown"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    history.orderCompleted
                                      ? "Completed"
                                      : history.cancelOrder
                                        ? "Cancelled"
                                        : "Active"
                                  }
                                  size="small"
                                  color={
                                    history.orderCompleted
                                      ? "success"
                                      : history.cancelOrder
                                        ? "error"
                                        : "warning"
                                  }
                                />
                              </TableCell>
                              <TableCell align="right">
                                ₹{history.expenseUser || 0}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          ) : (
            <Typography color="error">
              Failed to load booking details
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingsPage;
