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
  Alert,
  Stack,
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
  Work as WorkIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
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
const MAX_JOBS = 5;

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
        setEditForm({
          ...data.vendor,
          type: data.vendor.type || [],
          wageRate: data.vendor.wageRate || [],
          wageRateType: data.vendor.wageRateType || [],
        });
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
        setEditForm({
          ...data.vendor,
          type: data.vendor.type || [],
          wageRate: data.vendor.wageRate || [],
          wageRateType: data.vendor.wageRateType || [],
        });
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

  // Helper functions for array-based fields
  const getTypeDisplay = (vendor) => {
    if (!vendor?.type) return "N/A";
    if (Array.isArray(vendor.type)) {
      return vendor.type
        .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
        .join(", ");
    }
    if (typeof vendor.type === "string") {
      return vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1);
    }
    return "N/A";
  };

  const getFirstType = (vendor) => {
    if (!vendor?.type) return null;
    if (Array.isArray(vendor.type) && vendor.type.length > 0) {
      return vendor.type[0];
    }
    if (typeof vendor.type === "string") {
      return vendor.type;
    }
    return null;
  };

  const getJobCount = (vendor) => {
    if (!vendor?.type) return 0;
    if (Array.isArray(vendor.type)) return vendor.type.length;
    return 1;
  };

  const getWageRateDisplay = (vendor) => {
    if (!vendor?.wageRate) return "Not set";
    if (Array.isArray(vendor.wageRate)) {
      const maxRate = Math.max(...vendor.wageRate.filter((r) => r > 0));
      if (maxRate > 0) {
        return `₹${maxRate}`;
      }
      return "Not set";
    }
    return `₹${vendor.wageRate || 0}`;
  };

  const getWageRateTypeDisplay = (vendor) => {
    if (!vendor?.wageRateType) return "";
    if (Array.isArray(vendor.wageRateType)) {
      const types = vendor.wageRateType.filter((t) => t);
      if (types.length > 0) {
        return `/${types[0]}`;
      }
      return "";
    }
    return vendor.wageRateType ? `/${vendor.wageRateType}` : "";
  };

  // Edit form handlers for job entries
  const addJobEntry = () => {
    const currentTypes = editForm.type || [];
    const currentRates = editForm.wageRate || [];
    const currentRateTypes = editForm.wageRateType || [];

    if (currentTypes.length < MAX_JOBS) {
      setEditForm({
        ...editForm,
        type: [...currentTypes, ""],
        wageRate: [...currentRates, 0],
        wageRateType: [...currentRateTypes, "Day"],
      });
    } else {
      toast.warning(`Maximum ${MAX_JOBS} jobs allowed`);
    }
  };

  const removeJobEntry = (index) => {
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

  const updateJobEntry = (index, field, value) => {
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
    setEditForm({
      ...selectedVendor,
      type: selectedVendor.type || [],
      wageRate: selectedVendor.wageRate || [],
      wageRateType: selectedVendor.wageRateType || [],
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const updateData = {};
    const vendor = selectedVendor;
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
                  {getFirstType(selectedVendor) && (
                    <Chip
                      label={getFirstType(selectedVendor)}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    label={`${getJobCount(selectedVendor)} Jobs`}
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
                      <WorkIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Jobs:</strong> {getJobCount(selectedVendor)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WorkIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Type:</strong>{" "}
                        {getTypeDisplay(selectedVendor) || "N/A"}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WorkIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        <strong>Wage:</strong>{" "}
                        {getWageRateDisplay(selectedVendor)}
                        {getWageRateTypeDisplay(selectedVendor)}
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

      {/* Edit Dialog with Job Entries */}
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
              label={`${(editForm.type || []).length}/${MAX_JOBS} Jobs`}
              size="small"
              color={
                (editForm.type || []).length >= MAX_JOBS ? "warning" : "primary"
              }
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

            {/* Job Entries */}
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
                  onClick={addJobEntry}
                  disabled={(editForm.type || []).length >= MAX_JOBS}
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
                      onClick={() => removeJobEntry(index)}
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
                          updateJobEntry(index, "type", e.target.value)
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
                          updateJobEntry(index, "wageRate", e.target.value)
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
                            updateJobEntry(
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
                  value={editForm.commission || 0}
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
