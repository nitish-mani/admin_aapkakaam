// src/pages/UserManagementPage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Money as MoneyIcon,
  Visibility as VisibilityIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useMutation, useQueryClient } from "react-query";
import { adminService } from "../services/adminService";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
} from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MIN_SEARCH_LENGTH = 3;

const UserManagementPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchPhone, setSearchPhone] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Get user by phone
  const getUserMutation = useMutation(
    (phoneNo) => adminService.getUserByPhone(phoneNo),
    {
      onSuccess: (data) => {
        setSelectedUser(data.user);
        setEditForm(data.user);
        toast.success("User found successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "User not found");
        setSelectedUser(null);
      },
    },
  );

  // Update user
  const updateMutation = useMutation(
    ({ phoneNo, data }) => adminService.updateUserByPhone(phoneNo, data),
    {
      onSuccess: (data) => {
        setSelectedUser(data.user);
        queryClient.invalidateQueries("users");
        toast.success("User updated successfully");
        setEditDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Update failed");
      },
    },
  );

  // Block user
  const blockMutation = useMutation(
    (phoneNo) => adminService.blockUserByPhone(phoneNo),
    {
      onSuccess: (data) => {
        setSelectedUser(data.user);
        queryClient.invalidateQueries("users");
        toast.success("User blocked successfully");
        setBlockDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Block failed");
      },
    },
  );

  // Unblock user
  const unblockMutation = useMutation(
    (phoneNo) => adminService.unblockUserByPhone(phoneNo),
    {
      onSuccess: (data) => {
        setSelectedUser(data.user);
        queryClient.invalidateQueries("users");
        toast.success("User unblocked successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Unblock failed");
      },
    },
  );

  // Search users by phone
  const searchMutation = useMutation(
    (phoneNo) => adminService.searchUsersByPhone(phoneNo),
    {
      onSuccess: (data) => {
        if (data.users?.length > 0) {
          // If only one user found, go directly to detail page
          if (data.users.length === 1) {
            navigate(`/user-management/${data.users[0].phoneNo}`);
          } else {
            // Show toast with multiple results
            toast.info(
              `${data.users.length} users found. Click on a user to view details.`,
            );
            // You can add a dialog to show multiple results here
          }
        } else {
          toast.info("No users found with this phone number");
        }
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Search failed");
      },
    },
  );

  const handleSearch = () => {
    const phone = searchPhone.trim();
    if (!phone) {
      toast.warning("Please enter a phone number");
      return;
    }
    if (phone.length < MIN_SEARCH_LENGTH) {
      toast.warning(`Please enter at least ${MIN_SEARCH_LENGTH} digits`);
      return;
    }
    // If exact match (10+ digits), try to get user directly
    if (phone.length >= 10) {
      getUserMutation.mutate(phone);
    } else {
      // Partial search
      searchMutation.mutate(phone);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchPhone("");
    setSelectedUser(null);
  };

  const handleViewDetails = (phoneNo) => {
    navigate(`/user-management/${phoneNo}`);
  };

  const handleEdit = () => {
    setEditForm(selectedUser);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const updateData = {};
    const fields = ["name", "email", "gender", "pincode", "balance", "status"];
    fields.forEach((field) => {
      if (editForm[field] !== selectedUser[field]) {
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
      phoneNo: selectedUser.phoneNo,
      data: updateData,
    });
  };

  const handleBlock = () => {
    blockMutation.mutate(selectedUser.phoneNo);
  };

  const handleUnblock = () => {
    unblockMutation.mutate(selectedUser.phoneNo);
  };

  const isBlocked = selectedUser?.status === "blocked";
  const isLoading = getUserMutation.isLoading || searchMutation.isLoading;

  return (
    <>
      <Helmet>
        <title>User Management | Admin Panel</title>
      </Helmet>

      <Box mb={4}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
          User Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Search, view, update, and manage users by phone number
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <TextField
              fullWidth
              label="Phone Number"
              placeholder={`Enter phone number (min ${MIN_SEARCH_LENGTH} digits)...`}
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyPress={handleKeyPress}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <PhoneIcon sx={{ mr: 1, color: "action.active" }} />
                ),
                endAdornment: searchPhone && (
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={isLoading || searchPhone.length < MIN_SEARCH_LENGTH}
              size={isMobile ? "small" : "medium"}
            >
              {isLoading ? <CircularProgress size={24} /> : "Search"}
            </Button>
          </Grid>

          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={() => {
                if (searchPhone.length >= 10) {
                  getUserMutation.mutate(searchPhone);
                } else {
                  toast.warning(
                    "Please enter a valid phone number (10+ digits) for exact match",
                  );
                }
              }}
              disabled={isLoading || searchPhone.length < 10}
              size={isMobile ? "small" : "medium"}
            >
              Get User
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* User Details */}
      {selectedUser && (
        <Paper sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar
                sx={{
                  width: isMobile ? 48 : 64,
                  height: isMobile ? 48 : 64,
                  bgcolor: "primary.main",
                  fontSize: isMobile ? 20 : 28,
                }}
              >
                {selectedUser.name?.charAt(0).toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"}>
                  {selectedUser.name?.toUpperCase() || "Unknown"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <PhoneIcon
                    fontSize="small"
                    sx={{ mr: 0.5, verticalAlign: "middle" }}
                  />
                  {selectedUser.phoneNo}
                </Typography>
                <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                  <Chip
                    label={selectedUser.status?.toUpperCase() || "Active"}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(
                        selectedUser.status || "active",
                      ),
                      color: "white",
                    }}
                  />
                  {selectedUser.gender && (
                    <Chip
                      label={selectedUser.gender.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {selectedUser.pincode && (
                    <Chip
                      label={`Pincode: ${selectedUser.pincode}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                size={isMobile ? "small" : "medium"}
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => handleViewDetails(selectedUser.phoneNo)}
              >
                View All Details
              </Button>
              <Button
                size={isMobile ? "small" : "medium"}
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              {isBlocked ? (
                <Button
                  size={isMobile ? "small" : "medium"}
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleUnblock}
                  disabled={unblockMutation.isLoading}
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  size={isMobile ? "small" : "medium"}
                  variant="contained"
                  color="error"
                  startIcon={<BlockIcon />}
                  onClick={() => setBlockDialogOpen(true)}
                >
                  Block
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Personal Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Name:</strong>{" "}
                        {selectedUser.name?.toUpperCase() || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedUser.email || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedUser.phoneNo}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Pincode:</strong>{" "}
                        {selectedUser.pincode || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Gender:</strong>{" "}
                        {selectedUser.gender?.toUpperCase() || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Account Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Balance:</strong>{" "}
                        {formatCurrency(selectedUser.balance || 0)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Earning:</strong>{" "}
                        {formatCurrency(selectedUser.earning || 0)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Bookings:</strong>{" "}
                        {selectedUser.bookingCount || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Shares:</strong> {selectedUser.shareCount || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Transactions:</strong>{" "}
                        {selectedUser.transactionCount || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Joined:</strong>{" "}
                        {formatDate(selectedUser.accountCreatedOn)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* No User Found */}
      {!selectedUser &&
        !isLoading &&
        searchPhone.length >= 10 &&
        getUserMutation.isIdle && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              Enter a phone number and click "Search" or "Get User" to find a
              user
            </Typography>
          </Paper>
        )}

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
              size="small"
            />
            <TextField
              label="Email"
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Gender"
              value={editForm.gender || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, gender: e.target.value })
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Pincode"
              value={editForm.pincode || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, pincode: e.target.value })
              }
              fullWidth
              size="small"
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
              size="small"
            />
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
      <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
        <DialogTitle>Block User</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to block <strong>{selectedUser?.name}</strong>
            ? This user will not be able to access the application.
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

export default UserManagementPage;
