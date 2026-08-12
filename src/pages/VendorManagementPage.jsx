// src/pages/VendorManagementPage.jsx
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
  Switch,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Money as MoneyIcon,
  Star as StarIcon,
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

const VendorManagementPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchPhone, setSearchPhone] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Get vendor by phone
  const getVendorMutation = useMutation(
    (phoneNo) => adminService.getVendorByPhone(phoneNo),
    {
      onSuccess: (data) => {
        setSelectedVendor(data.vendor);
        setEditForm(data.vendor);
        toast.success("Vendor found successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Vendor not found");
        setSelectedVendor(null);
      },
    },
  );

  // Update vendor
  const updateMutation = useMutation(
    ({ phoneNo, data }) => adminService.updateVendorByPhone(phoneNo, data),
    {
      onSuccess: (data) => {
        setSelectedVendor(data.vendor);
        queryClient.invalidateQueries("vendors");
        toast.success("Vendor updated successfully");
        setEditDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Update failed");
      },
    },
  );

  // Block vendor
  const blockMutation = useMutation(
    (phoneNo) => adminService.blockVendorByPhone(phoneNo),
    {
      onSuccess: (data) => {
        setSelectedVendor(data.vendor);
        queryClient.invalidateQueries("vendors");
        toast.success("Vendor blocked successfully");
        setBlockDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Block failed");
      },
    },
  );

  // Unblock vendor
  const unblockMutation = useMutation(
    (phoneNo) => adminService.unblockVendorByPhone(phoneNo),
    {
      onSuccess: (data) => {
        setSelectedVendor(data.vendor);
        queryClient.invalidateQueries("vendors");
        toast.success("Vendor unblocked successfully");
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Unblock failed");
      },
    },
  );

  // Search vendors by phone
  const searchMutation = useMutation(
    (phoneNo) => adminService.searchVendorsByPhone(phoneNo),
    {
      onSuccess: (data) => {
        if (data.vendors?.length > 0) {
          if (data.vendors.length === 1) {
            navigate(`/vendor-management/${data.vendors[0].phoneNo}`);
          } else {
            toast.info(
              `${data.vendors.length} vendors found. Click on a vendor to view details.`,
            );
          }
        } else {
          toast.info("No vendors found with this phone number");
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
    if (phone.length >= 10) {
      getVendorMutation.mutate(phone);
    } else {
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
    setSelectedVendor(null);
  };

  const handleViewDetails = (phoneNo) => {
    navigate(`/vendor-management/${phoneNo}`);
  };

  const handleEdit = () => {
    setEditForm(selectedVendor);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const updateData = {};
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
      "experience",
      "commission",
    ];
    fields.forEach((field) => {
      if (editForm[field] !== selectedVendor[field]) {
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
      phoneNo: selectedVendor.phoneNo,
      data: updateData,
    });
  };

  const handleBlock = () => {
    blockMutation.mutate(selectedVendor.phoneNo);
  };

  const handleUnblock = () => {
    unblockMutation.mutate(selectedVendor.phoneNo);
  };

  const isBlocked = selectedVendor?.status === "blocked";
  const isLoading = getVendorMutation.isLoading || searchMutation.isLoading;

  return (
    <>
      <Helmet>
        <title>Vendor Management | Admin Panel</title>
      </Helmet>

      <Box mb={4}>
        <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
          Vendor Management
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Search, view, update, and manage vendors by phone number
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
              startIcon={<StoreIcon />}
              onClick={() => {
                if (searchPhone.length >= 10) {
                  getVendorMutation.mutate(searchPhone);
                } else {
                  toast.warning(
                    "Please enter a valid phone number (10+ digits) for exact match",
                  );
                }
              }}
              disabled={isLoading || searchPhone.length < 10}
              size={isMobile ? "small" : "medium"}
            >
              Get Vendor
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Vendor Details */}
      {selectedVendor && (
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
                  bgcolor: "secondary.main",
                  fontSize: isMobile ? 20 : 28,
                }}
              >
                {selectedVendor.name?.charAt(0).toUpperCase() || "V"}
              </Avatar>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"}>
                  {selectedVendor.name?.toUpperCase() || "Unknown"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <PhoneIcon
                    fontSize="small"
                    sx={{ mr: 0.5, verticalAlign: "middle" }}
                  />
                  {selectedVendor.phoneNo}
                </Typography>
                <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                  <Chip
                    label={selectedVendor.status?.toUpperCase() || "Active"}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(
                        selectedVendor.status || "active",
                      ),
                      color: "white",
                    }}
                  />
                  <Chip
                    label={selectedVendor.type?.toUpperCase() || "General"}
                    size="small"
                    variant="outlined"
                  />
                  {selectedVendor.isVerified && (
                    <Chip label="Verified" size="small" color="success" />
                  )}
                  {selectedVendor.gender && (
                    <Chip
                      label={selectedVendor.gender.toUpperCase()}
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
                onClick={() => handleViewDetails(selectedVendor.phoneNo)}
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
                      <StoreIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Name:</strong>{" "}
                        {selectedVendor.name?.toUpperCase() || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Email:</strong> {selectedVendor.email || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Phone:</strong> {selectedVendor.phoneNo}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Pincode:</strong>{" "}
                        {selectedVendor.pincode || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StoreIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Type:</strong>{" "}
                        {selectedVendor.type?.toUpperCase() || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StoreIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Experience:</strong>{" "}
                        {selectedVendor.experience || 0} years
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
                        {formatCurrency(selectedVendor.balance || 0)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Earnings:</strong>{" "}
                        {formatCurrency(selectedVendor.earning || 0)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MoneyIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Commission:</strong>{" "}
                        {formatCurrency(selectedVendor.commission || 0)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StoreIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Bookings:</strong>{" "}
                        {selectedVendor.bookingCount || 0}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StarIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Rating:</strong>{" "}
                        {selectedVendor.rating?.toFixed(1) || "0.0"} ★
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <StoreIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Joined:</strong>{" "}
                        {formatDate(selectedVendor.accountCreatedOn)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* No Vendor Found */}
      {!selectedVendor &&
        !isLoading &&
        searchPhone.length >= 10 &&
        getVendorMutation.isIdle && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="textSecondary">
              Enter a phone number and click "Search" or "Get Vendor" to find a
              vendor
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
        <DialogTitle>Edit Vendor</DialogTitle>
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
              label="Type"
              value={editForm.type || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, type: e.target.value })
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
            <TextField
              label="Wage Rate"
              type="number"
              value={editForm.wageRate || 0}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  wageRate: parseFloat(e.target.value) || 0,
                })
              }
              fullWidth
              size="small"
            />
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
            />
            <TextField
              label="Commission"
              type="number"
              value={editForm.commission || 0}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  commission: parseFloat(e.target.value) || 0,
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
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isVerified || false}
                  onChange={(e) =>
                    setEditForm({ ...editForm, isVerified: e.target.checked })
                  }
                />
              }
              label="Verified"
            />
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
        <DialogTitle>Block Vendor</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to block{" "}
            <strong>{selectedVendor?.name}</strong>? This vendor will not be
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

export default VendorManagementPage;
