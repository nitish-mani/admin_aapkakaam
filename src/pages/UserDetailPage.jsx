// src/pages/UserDetailPage.jsx
import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Person as PersonIcon,
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
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
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

const UserDetailPage = () => {
  const navigate = useNavigate();
  const { phoneNo } = useParams();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Fetch user complete details
  const { data, isLoading, refetch } = useQuery(
    ["userComplete", phoneNo, page, rowsPerPage],
    () =>
      adminService.getUserComplete(phoneNo, {
        page: page + 1,
        limit: rowsPerPage,
      }),
    {
      enabled: !!phoneNo,
      refetchOnWindowFocus: false,
    },
  );

  // Update user mutation
  const updateMutation = useMutation(
    ({ phoneNo, data }) => adminService.updateUserByPhone(phoneNo, data),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("userComplete");
        toast.success("User updated successfully");
        setEditDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Update failed");
      },
    },
  );

  // Block user mutation
  const blockMutation = useMutation(
    (phoneNo) => adminService.blockUserByPhone(phoneNo),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("userComplete");
        toast.success("User blocked successfully");
        setBlockDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Block failed");
      },
    },
  );

  // Unblock user mutation
  const unblockMutation = useMutation(
    (phoneNo) => adminService.unblockUserByPhone(phoneNo),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries("userComplete");
        toast.success("User unblocked successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Unblock failed");
      },
    },
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = () => {
    setEditForm(data?.data?.user || {});
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const updateData = {};
    const user = data?.data?.user;
    const fields = ["name", "email", "gender", "pincode", "balance", "status"];
    fields.forEach((field) => {
      if (editForm[field] !== user[field]) {
        updateData[field] = editForm[field];
      }
    });
    if (editForm.password) {
      updateData.password = editForm.password;
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

  if (isLoading) return <LoadingSpinner />;

  const userData = data?.data;
  const user = userData?.user;
  const bookings = userData?.bookings?.data || [];
  const transactions = userData?.transactions?.data || [];
  const walletLedger = userData?.walletLedger?.data || [];
  const referrals = userData?.referrals?.data || [];
  const stats = userData?.stats || {};
  const pagination = userData?.bookings?.pagination || {
    total: 0,
    totalPages: 0,
  };

  const isBlocked = user?.status === "blocked";

  return (
    <>
      <Helmet>
        <title>User Details | Admin Panel</title>
      </Helmet>

      <Box mb={3}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <IconButton onClick={() => navigate("/user-management")}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700}>
            User Details
          </Typography>
        </Box>
      </Box>

      {/* User Profile Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
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
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                fontSize: 28,
              }}
            >
              {user?.name?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="h5">{user?.name || "Unknown"}</Typography>
              <Typography variant="body2" color="textSecondary">
                <PhoneIcon
                  fontSize="small"
                  sx={{ mr: 0.5, verticalAlign: "middle" }}
                />
                {user?.phoneNo}
              </Typography>
              <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                <Chip
                  label={user?.status || "Active"}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(user?.status || "active"),
                    color: "white",
                  }}
                />
                {user?.gender && (
                  <Chip label={user.gender} size="small" variant="outlined" />
                )}
                {user?.pincode && (
                  <Chip
                    label={`Pincode: ${user.pincode}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Edit User">
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                onClick={handleEdit}
              >
                Edit
              </Button>
            </Tooltip>
            {isBlocked ? (
              <Button
                startIcon={<CheckCircleIcon />}
                variant="contained"
                color="success"
                onClick={handleUnblock}
              >
                Unblock
              </Button>
            ) : (
              <Button
                startIcon={<BlockIcon />}
                variant="contained"
                color="error"
                onClick={() => setBlockDialogOpen(true)}
              >
                Block
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Bookings
              </Typography>
              <Typography variant="h6">
                {formatNumber(stats?.bookings?.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Spent
              </Typography>
              <Typography variant="h6">
                {formatCurrency(stats?.bookings?.totalSpent || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Balance
              </Typography>
              <Typography variant="h6">
                {formatCurrency(user?.balance || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Total Earnings By Share
              </Typography>
              <Typography variant="h6">
                {formatCurrency(user?.earning || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="caption">
                Referrals
              </Typography>
              <Typography variant="h6">
                {formatNumber(user?.shareCount || 0)}
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
          variant="scrollable"
          scrollButtons="auto"
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
        </Tabs>

        <Box p={3}>
          {/* Bookings Tab */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Booking History
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking ID</TableCell>
                      <TableCell>Vendor</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No bookings found
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow key={booking._id} hover>
                          <TableCell>#{booking._id?.slice(-6)}</TableCell>
                          <TableCell>
                            {booking.vendorId?.name || "Unknown"}
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
                          <TableCell>₹{booking.expenseUser || 0}</TableCell>
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
                      <TableCell>Referred User</TableCell>
                      <TableCell>Vendor</TableCell>
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
                          <TableCell>{ref.vendorId?.name || "N/A"}</TableCell>
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
        </Box>
      </Paper>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Name"
              value={editForm.name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email"
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Gender"
              value={editForm.gender || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, gender: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Pincode"
              value={editForm.pincode || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, pincode: e.target.value })
              }
              fullWidth
            />
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
            />
            <FormControl fullWidth>
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
            <TextField
              label="New Password (optional)"
              type="password"
              value={editForm.password || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, password: e.target.value })
              }
              fullWidth
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
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>Block User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to block {user?.name}? This user will not be
            able to access the application.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleBlock}
            disabled={blockMutation.isLoading}
          >
            {blockMutation.isLoading ? <CircularProgress size={24} /> : "Block"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserDetailPage;
