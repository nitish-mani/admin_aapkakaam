// src/pages/VendorDetailPage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  useMediaQuery,
  useTheme,
  Icon,
} from "@mui/material";
import {
  Store as StoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Money as MoneyIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Receipt as ReceiptIcon,
  Wallet as WalletIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventNoteIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  EventBusy as EventBusyIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { adminService } from "../services/adminService";
import { useNavigate, useParams } from "react-router-dom";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  getStatusColor,
} from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const VendorDetailPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { phoneNo } = useParams();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [leaveForm, setLeaveForm] = useState({ from: "", to: "", reason: "" });

  // Fetch vendor complete details
  const { data, isLoading, refetch } = useQuery(
    ["vendorComplete", phoneNo, page, rowsPerPage],
    () =>
      adminService.getVendorComplete(phoneNo, {
        page: page + 1,
        limit: rowsPerPage,
      }),
    {
      enabled: !!phoneNo,
      refetchOnWindowFocus: false,
    },
  );

  // Update vendor mutation
  const updateMutation = useMutation(
    ({ phoneNo, data }) => adminService.updateVendorByPhone(phoneNo, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("vendorComplete");
        toast.success("Vendor updated successfully");
        setEditDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Update failed");
      },
    },
  );

  // Block vendor mutation
  const blockMutation = useMutation(
    (phoneNo) => adminService.blockVendorByPhone(phoneNo),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("vendorComplete");
        toast.success("Vendor blocked successfully");
        setBlockDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Block failed");
      },
    },
  );

  // Unblock vendor mutation
  const unblockMutation = useMutation(
    (phoneNo) => adminService.unblockVendorByPhone(phoneNo),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("vendorComplete");
        toast.success("Vendor unblocked successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Unblock failed");
      },
    },
  );

  // Create leave mutation
  const createLeaveMutation = useMutation(
    ({ phoneNo, data }) => adminService.createVendorLeave(phoneNo, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("vendorComplete");
        toast.success("Leave created successfully");
        setLeaveDialogOpen(false);
        setLeaveForm({ from: "", to: "", reason: "" });
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to create leave");
      },
    },
  );

  // Update leave mutation
  const updateLeaveMutation = useMutation(
    ({ leaveId, data }) => adminService.updateVendorLeave(leaveId, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("vendorComplete");
        toast.success("Leave updated successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to update leave");
      },
    },
  );

  // Delete leave mutation
  const deleteLeaveMutation = useMutation(
    (leaveId) => adminService.deleteVendorLeave(leaveId),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("vendorComplete");
        toast.success("Leave deleted successfully");
        setDeleteDialogOpen(false);
        setLeaveToDelete(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Failed to delete leave");
      },
    },
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = () => {
    const vendor = data?.data?.vendor || {};
    setEditForm({
      name: vendor.name || "",
      email: vendor.email || "",
      type: vendor.type || [],
      gender: vendor.gender || "",
      pincode: vendor.pincode || "",
      balance: vendor.balance || 0,
      status: vendor.status || "active",
      isVerified: vendor.isVerified || false,
      wageRate: vendor.wageRate || [],
      wageRateType: vendor.wageRateType || [],
      experience: vendor.experience || 0,
      commission: vendor.commission || 50,
      password: "",
    });
    setEditDialogOpen(true);
  };

  // Helper to add a new wage rate entry
  const addWageRateEntry = () => {
    const currentTypes = editForm.type || [];
    const currentRates = editForm.wageRate || [];
    const currentRateTypes = editForm.wageRateType || [];

    // Only add if there's room (max 5 jobs)
    if (currentTypes.length < 5) {
      setEditForm({
        ...editForm,
        type: [...currentTypes, ""],
        wageRate: [...currentRates, 0],
        wageRateType: [...currentRateTypes, "Day"],
      });
    }
  };

  // Helper to remove a wage rate entry
  const removeWageRateEntry = (index) => {
    const currentTypes = editForm.type || [];
    const currentRates = editForm.wageRate || [];
    const currentRateTypes = editForm.wageRateType || [];

    if (currentTypes.length > 1) {
      setEditForm({
        ...editForm,
        type: currentTypes.filter((_, i) => i !== index),
        wageRate: currentRates.filter((_, i) => i !== index),
        wageRateType: currentRateTypes.filter((_, i) => i !== index),
      });
    } else {
      toast.warning("Vendor must have at least one job");
    }
  };

  // Helper to update a specific wage rate entry
  const updateWageRateEntry = (index, field, value) => {
    const currentTypes = [...(editForm.type || [])];
    const currentRates = [...(editForm.wageRate || [])];
    const currentRateTypes = [...(editForm.wageRateType || [])];

    if (field === "type") {
      currentTypes[index] = value;
    } else if (field === "wageRate") {
      currentRates[index] = parseFloat(value) || 0;
    } else if (field === "wageRateType") {
      currentRateTypes[index] = value;
    }

    setEditForm({
      ...editForm,
      type: currentTypes,
      wageRate: currentRates,
      wageRateType: currentRateTypes,
    });
  };

  const handleSaveEdit = () => {
    const updateData = {};
    const vendor = data?.data?.vendor;

    const fields = [
      "name",
      "email",
      "type",
      "gender",
      "pincode",
      "balance",
      "status",
      "isVerified",
      "wageRate",
      "wageRateType",
      "experience",
      "commission",
    ];

    fields.forEach((field) => {
      // Compare arrays properly
      if (Array.isArray(editForm[field]) && Array.isArray(vendor[field])) {
        if (JSON.stringify(editForm[field]) !== JSON.stringify(vendor[field])) {
          updateData[field] = editForm[field];
        }
      } else if (editForm[field] !== vendor[field]) {
        updateData[field] = editForm[field];
      }
    });

    if (editForm.password && editForm.password.trim()) {
      updateData.password = editForm.password.trim();
    }

    if (Object.keys(updateData).length === 0) {
      toast.info("No changes to save");
      return;
    }

    updateMutation.mutate({
      phoneNo: phoneNo,
      data: updateData,
    });
  };

  const handleBlock = () => {
    blockMutation.mutate(phoneNo);
  };

  const handleUnblock = () => {
    unblockMutation.mutate(phoneNo);
  };

  const handleCreateLeave = () => {
    if (!leaveForm.from || !leaveForm.to) {
      toast.warning("Please select both from and to dates");
      return;
    }
    createLeaveMutation.mutate({
      phoneNo: phoneNo,
      data: leaveForm,
    });
  };

  const handleUpdateLeaveStatus = (leaveId, status) => {
    updateLeaveMutation.mutate({
      leaveId: leaveId,
      data: { status },
    });
  };

  const handleDeleteLeave = (leaveId) => {
    setLeaveToDelete(leaveId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteLeave = () => {
    if (leaveToDelete) {
      deleteLeaveMutation.mutate(leaveToDelete);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const vendorData = data?.data;
  const vendor = vendorData?.vendor;
  const bookings = vendorData?.bookings?.data || [];
  const transactions = vendorData?.transactions?.data || [];
  const walletLedger = vendorData?.walletLedger?.data || [];
  const referrals = vendorData?.referrals?.data || [];
  const leaves = vendorData?.leaves?.data || [];
  const stats = vendorData?.stats || {};
  const bookingByType = vendorData?.bookings?.bookingByType || [];
  const pagination = vendorData?.bookings?.pagination || {
    total: 0,
    totalPages: 0,
  };
  const leaveStats = vendorData?.leaves?.stats || {
    total: 0,
    active: 0,
    cancelled: 0,
    currentActive: 0,
  };

  const isBlocked = vendor?.status === "blocked";

  // Helper to display wage rate entries
  const renderWageEntries = () => {
    const types = vendor?.type || [];
    const rates = vendor?.wageRate || [];
    const rateTypes = vendor?.wageRateType || [];

    if (types.length === 0) {
      return <Typography color="textSecondary">No jobs configured</Typography>;
    }

    return types.map((job, index) => (
      <Box
        key={index}
        sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
      >
        <Chip
          label={job.toUpperCase()}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Typography variant="body2" fontWeight={500}>
          ₹{rates[index] || 0}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          / {rateTypes[index] || "Day"}
        </Typography>
        {index < types.length - 1 && (
          <Divider orientation="vertical" flexItem />
        )}
      </Box>
    ));
  };

  // Get leave details for delete confirmation
  const getLeaveDetails = (leaveId) => {
    return leaves.find((l) => l._id === leaveId);
  };

  return (
    <>
      <Helmet>
        <title>Vendor Details | Admin Panel</title>
      </Helmet>

      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton onClick={() => navigate("/vendor-management")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
            Vendor Details
          </Typography>
        </Box>
      </Box>

      {/* Vendor Profile Card */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: isMobile ? 48 : 64,
                height: isMobile ? 48 : 64,
                bgcolor: "secondary.main",
                fontSize: isMobile ? 20 : 28,
              }}
            >
              {vendor?.name?.charAt(0)?.toUpperCase() || "V"}
            </Avatar>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"}>
                {vendor?.name?.toUpperCase() || "Unknown"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <PhoneIcon
                  fontSize="small"
                  sx={{ mr: 0.5, verticalAlign: "middle" }}
                />
                {vendor?.phoneNo}
              </Typography>
              <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                <Chip
                  label={vendor?.status?.toUpperCase() || "Active"}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(vendor?.status || "active"),
                    color: "white",
                  }}
                />
                {vendor?.type && vendor.type.length > 0 && (
                  <Chip
                    label={`${vendor.type.length} Jobs`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {vendor?.isVerified && (
                  <Chip label="Verified" size="small" color="success" />
                )}
                {vendor?.gender && (
                  <Chip
                    label={vendor.gender.toUpperCase()}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              startIcon={<EventNoteIcon />}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              onClick={() => setLeaveDialogOpen(true)}
            >
              {isMobile ? "Leave" : "Add Leave"}
            </Button>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              onClick={handleEdit}
            >
              {isMobile ? "" : "Edit"}
            </Button>
            {isBlocked ? (
              <Button
                startIcon={<CheckCircleIcon />}
                variant="contained"
                color="success"
                size={isMobile ? "small" : "medium"}
                onClick={handleUnblock}
              >
                {isMobile ? "" : "Unblock"}
              </Button>
            ) : (
              <Button
                startIcon={<BlockIcon />}
                variant="contained"
                color="error"
                size={isMobile ? "small" : "medium"}
                onClick={() => setBlockDialogOpen(true)}
              >
                {isMobile ? "" : "Block"}
              </Button>
            )}
          </Box>
        </Box>

        {/* Wage Rate Summary */}
        {vendor?.type && vendor.type.length > 0 && (
          <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              gutterBottom
            >
              Wage Rates
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} alignItems="center">
              {renderWageEntries()}
            </Box>
          </Box>
        )}
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 2 : 3}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Total Bookings
              </Typography>
              <Typography variant={isMobile ? "body1" : "h6"}>
                {formatNumber(stats?.bookings?.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Total Earnings By Share
              </Typography>
              <Typography variant={isMobile ? "body1" : "h6"}>
                {formatCurrency(vendor?.earnings || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Balance
              </Typography>
              <Typography variant={isMobile ? "body1" : "h6"}>
                {formatCurrency(vendor?.balance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Active Leaves
              </Typography>
              <Typography variant={isMobile ? "body1" : "h6"}>
                {formatNumber(leaveStats?.currentActive || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Bookings" icon={<BookmarkIcon />} iconPosition="start" />
          <Tab
            label="Transactions"
            icon={<ReceiptIcon />}
            iconPosition="start"
          />
          <Tab
            label="Wallet Ledger"
            icon={<WalletIcon />}
            iconPosition="start"
          />
          <Tab label="Referrals" icon={<ShareIcon />} iconPosition="start" />
          <Tab label="Leaves" icon={<CalendarIcon />} iconPosition="start" />
        </Tabs>

        <Box p={isMobile ? 1.5 : 3}>
          {/* Bookings Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Booking History
              </Typography>
              {bookingByType.length > 0 && (
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {bookingByType.map((type) => (
                    <Chip
                      key={type._id}
                      label={`${type._id}: ${type.count} (${type.completed || 0} completed)`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>By</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking._id} hover>
                          <TableCell>#{booking._id?.slice(-6)}</TableCell>
                          <TableCell>
                            {booking.bookedById?.name?.toUpperCase() ||
                              "Unknown"}
                          </TableCell>
                          <TableCell>
                            {formatDate(booking.bookingDate)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                booking.orderCompleted
                                  ? "Completed"
                                  : booking.cancelOrder
                                    ? "Cancelled"
                                    : "Active"
                              }
                              size="small"
                              color={
                                booking.orderCompleted
                                  ? "success"
                                  : booking.cancelOrder
                                    ? "error"
                                    : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell>₹{booking.expenseVendor || 0}</TableCell>
                          <TableCell>{booking.bookingBy || "N/A"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={pagination.total || 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          )}

          {/* Transactions Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Gateway</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx._id} hover>
                          <TableCell>#{tx._id?.slice(-6)}</TableCell>
                          <TableCell>
                            {formatCurrency(tx.finalAmount || tx.amount || 0)}
                          </TableCell>
                          <TableCell>{tx.paymentGateway || "N/A"}</TableCell>
                          <TableCell>
                            <Chip
                              label={tx.status || "Pending"}
                              size="small"
                              color={
                                tx.status === "completed"
                                  ? "success"
                                  : tx.status === "failed"
                                    ? "error"
                                    : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell>{formatDate(tx.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Wallet Ledger Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Wallet Ledger
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Entry Type</TableCell>
                      <TableCell>Credit</TableCell>
                      <TableCell>Debit</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {walletLedger.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No wallet entries found
                        </TableCell>
                      </TableRow>
                    ) : (
                      walletLedger.map((entry) => (
                        <TableRow key={entry._id} hover>
                          <TableCell>
                            <Chip
                              label={entry.entryType || "Unknown"}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ color: "success.main" }}>
                            {entry.credit > 0
                              ? formatCurrency(entry.credit)
                              : "-"}
                          </TableCell>
                          <TableCell sx={{ color: "error.main" }}>
                            {entry.debit > 0
                              ? formatCurrency(entry.debit)
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(entry.balanceAfter || 0)}
                          </TableCell>
                          <TableCell>{entry.source || "N/A"}</TableCell>
                          <TableCell>{formatDate(entry.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Referrals Tab */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Referrals
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Referred Phone</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {referrals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No referrals found
                        </TableCell>
                      </TableRow>
                    ) : (
                      referrals.map((ref) => (
                        <TableRow key={ref._id} hover>
                          <TableCell>{ref.phoneNo || "N/A"}</TableCell>
                          <TableCell>
                            {ref.userId?.name?.toUpperCase() || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={ref.status || "Pending"}
                              size="small"
                              color={
                                ref.status === "completed"
                                  ? "success"
                                  : "warning"
                              }
                            />
                          </TableCell>
                          <TableCell>{formatDate(ref.shareDate)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Leaves Tab */}
          {tabValue === 4 && (
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="h6">Leaves</Typography>
                <Button
                  startIcon={<EventNoteIcon />}
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  Add Leave
                </Button>
              </Box>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label={`Total: ${leaveStats.total || 0}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Active: ${leaveStats.active || 0}`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`Current Active: ${leaveStats.currentActive || 0}`}
                  size="small"
                  color="warning"
                />
                <Chip
                  label={`Cancelled: ${leaveStats.cancelled || 0}`}
                  size="small"
                  color="error"
                />
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No leaves found
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaves.map((leave) => {
                        const isActive = leave.status === "active";
                        return (
                          <TableRow key={leave._id} hover>
                            <TableCell>{formatDate(leave.from)}</TableCell>
                            <TableCell>{formatDate(leave.to)}</TableCell>
                            <TableCell>{leave.reason || "N/A"}</TableCell>
                            <TableCell>
                              <Chip
                                label={leave.status || "Active"}
                                size="small"
                                color={isActive ? "success" : "error"}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {isActive ? (
                                <Tooltip title="Cancel Leave">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleUpdateLeaveStatus(
                                        leave._id,
                                        "cancelled",
                                      )
                                    }
                                  >
                                    <BlockIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ) : (
                                <Tooltip title="Activate Leave">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() =>
                                      handleUpdateLeaveStatus(
                                        leave._id,
                                        "active",
                                      )
                                    }
                                  >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Delete Leave">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteLeave(leave._id)}
                                >
                                  <DeleteIcon fontSize="small" />
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
            </Box>
          )}
        </Box>
      </Paper>

      {/* Edit Dialog - Updated for array fields */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={600}>
              Edit Vendor
            </Typography>
            <Chip
              label={`${(editForm.type || []).length}/5 Jobs`}
              size="small"
              color={(editForm.type || []).length >= 5 ? "warning" : "primary"}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Basic Info */}
            <Typography
              variant="subtitle2"
              color="textSecondary"
              fontWeight={600}
            >
              Basic Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Gender"
                  value={editForm.gender || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, gender: e.target.value })
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Pincode"
                  value={editForm.pincode || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, pincode: e.target.value })
                  }
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Wage Rate Entries */}
            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  fontWeight={600}
                >
                  Jobs & Wage Rates
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addWageRateEntry}
                  disabled={(editForm.type || []).length >= 5}
                  variant="outlined"
                >
                  Add Job
                </Button>
              </Box>

              {(editForm.type || []).map((job, index) => (
                <Box
                  key={index}
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "background.default",
                    borderRadius: 1,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="caption" color="textSecondary">
                      Job #{index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeWageRateEntry(index)}
                      disabled={(editForm.type || []).length <= 1}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Job Type"
                        value={job}
                        onChange={(e) =>
                          updateWageRateEntry(index, "type", e.target.value)
                        }
                        fullWidth
                        size="small"
                        placeholder="e.g. electrician"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Wage Rate (₹)"
                        type="number"
                        value={editForm.wageRate?.[index] || 0}
                        onChange={(e) =>
                          updateWageRateEntry(index, "wageRate", e.target.value)
                        }
                        fullWidth
                        size="small"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Rate Type</InputLabel>
                        <Select
                          value={editForm.wageRateType?.[index] || "Day"}
                          onChange={(e) =>
                            updateWageRateEntry(
                              index,
                              "wageRateType",
                              e.target.value,
                            )
                          }
                          label="Rate Type"
                        >
                          <MenuItem value="Day">Per Day</MenuItem>
                          <MenuItem value="Hour">Per Hour</MenuItem>
                          <MenuItem value="Km">Per Km</MenuItem>
                          <MenuItem value="1k People">Per 1k People</MenuItem>
                          <MenuItem value="Service">Per Service</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              {(editForm.type || []).length === 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  No jobs added. Click "Add Job" to add a job with wage rate.
                </Alert>
              )}
            </Box>

            <Divider />

            {/* Financial Info */}
            <Typography
              variant="subtitle2"
              color="textSecondary"
              fontWeight={600}
            >
              Financial Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Balance"
                  type="number"
                  value={editForm.balance || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      balance: parseFloat(e.target.value) || 0,
                    })
                  }
                  fullWidth
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Experience (years)"
                  type="number"
                  value={editForm.experience || 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      experience: parseInt(e.target.value) || 0,
                    })
                  }
                  fullWidth
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Commission"
                  type="number"
                  value={editForm.commission || 50}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      commission: parseFloat(e.target.value) || 0,
                    })
                  }
                  fullWidth
                  size="small"
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
            </Grid>

            <Divider />

            {/* Account Settings */}
            <Typography
              variant="subtitle2"
              color="textSecondary"
              fontWeight={600}
            >
              Account Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editForm.status || "active"}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editForm.isVerified || false}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          isVerified: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Verified"
                />
              </Grid>
            </Grid>

            <TextField
              label="New Password (optional)"
              type="password"
              value={editForm.password || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, password: e.target.value })
              }
              fullWidth
              size="small"
              helperText="Leave blank to keep current password"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Confirmation Dialog */}
      <Dialog
        open={blockDialogOpen}
        onClose={() => setBlockDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <BlockIcon sx={{ color: "error.main", fontSize: 28 }} />
          <Typography variant="h6" fontWeight={600}>
            Block Vendor
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "error.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <BlockIcon sx={{ fontSize: 40, color: "error.main" }} />
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Are you sure?
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              You are about to block <strong>{vendor?.name}</strong>.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              This vendor will not be able to access the application.
            </Typography>
            <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
              This action can be reversed by unblocking the vendor.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 1,
          }}
        >
          <Button
            onClick={() => setBlockDialogOpen(false)}
            variant="outlined"
            size="large"
            sx={{ flex: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBlock}
            variant="contained"
            color="error"
            size="large"
            sx={{ flex: 1 }}
            disabled={blockMutation.isLoading}
            startIcon={
              blockMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <BlockIcon />
              )
            }
          >
            {blockMutation.isLoading ? "Blocking..." : "Block"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Leave Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="From Date"
              type="date"
              value={leaveForm.from}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, from: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="To Date"
              type="date"
              value={leaveForm.to}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, to: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="Reason"
              value={leaveForm.reason}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, reason: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
              placeholder="Enter reason for leave"
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateLeave}
            disabled={createLeaveMutation.isLoading}
          >
            {createLeaveMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Add Leave"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Leave Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setLeaveToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <EventBusyIcon sx={{ color: "error.main" }} />
            <Typography variant="h6" fontWeight={600}>
              Delete Leave
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              setDeleteDialogOpen(false);
              setLeaveToDelete(null);
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 4px 20px rgba(238, 90, 36, 0.3)",
              }}
            >
              <DeleteIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              Delete Leave Record?
            </Typography>

            <Typography variant="body2" color="textSecondary">
              This action cannot be undone. The leave record will be permanently
              removed.
            </Typography>
          </Box>

          {/* Leave Details Card */}
          {leaveToDelete && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "background.default",
                borderRadius: 2,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Leave Details
              </Typography>
              {(() => {
                const leave = getLeaveDetails(leaveToDelete);
                if (!leave)
                  return (
                    <Typography variant="body2" color="textSecondary">
                      Leave details not found
                    </Typography>
                  );
                const from = new Date(leave.from);
                const to = new Date(leave.to);
                const durationDays =
                  Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        From
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(leave.from)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        To
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {formatDate(leave.to)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Duration
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {durationDays} day{durationDays > 1 ? "s" : ""}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={leave.status}
                        size="small"
                        color={leave.status === "active" ? "success" : "error"}
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="textSecondary">
                        Reason
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {leave.reason || "No reason provided"}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              })()}
            </Paper>
          )}

          {/* Vendor Info */}
          {vendor && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                bgcolor: "primary.light",
                borderRadius: 2,
                color: "primary.contrastText",
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Vendor Information
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {vendor.name}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {vendor.phoneNo}
              </Typography>
            </Box>
          )}

          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              borderRadius: 2,
              "& .MuiAlert-message": {
                fontWeight: 500,
              },
            }}
          >
            <Typography variant="body2">
              <strong>Warning:</strong> This action is irreversible. All
              associated data will be permanently removed.
            </Typography>
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 1,
          }}
        >
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setLeaveToDelete(null);
            }}
            variant="outlined"
            size="large"
            sx={{
              flex: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
            disabled={deleteLeaveMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteLeave}
            variant="contained"
            color="error"
            size="large"
            sx={{
              flex: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(211, 47, 47, 0.3)",
            }}
            disabled={deleteLeaveMutation.isLoading}
            startIcon={
              deleteLeaveMutation.isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DeleteIcon />
              )
            }
          >
            {deleteLeaveMutation.isLoading
              ? "Deleting..."
              : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VendorDetailPage;
