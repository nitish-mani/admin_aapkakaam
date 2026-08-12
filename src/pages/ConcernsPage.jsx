// src/pages/ConcernsPage.jsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Flag as FlagIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { concernService } from "../services/concernService";
import { formatDate, formatNumber, getStatusColor } from "../utils/formatters";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const ConcernsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [raisedByFilter, setRaisedByFilter] = useState("");
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminResponse, setAdminResponse] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Fetch all concerns
  const { data, isLoading, refetch } = useQuery(
    [
      "concerns",
      page,
      rowsPerPage,
      searchTerm,
      statusFilter,
      categoryFilter,
      priorityFilter,
      raisedByFilter,
    ],
    () =>
      concernService.getAllConcerns({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        raisedBy: raisedByFilter,
      }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch single concern detail
  const { data: concernDetail, refetch: refetchDetail } = useQuery(
    ["concernDetail", selectedConcern],
    () =>
      selectedConcern ? concernService.getConcernById(selectedConcern) : null,
    {
      enabled: !!selectedConcern,
      refetchOnWindowFocus: false,
    },
  );

  // Update status mutation
  const updateStatusMutation = useMutation(
    ({ concernId, data }) =>
      concernService.updateConcernStatus(concernId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("concerns");
        queryClient.invalidateQueries("concernDetail");
        toast.success("Concern status updated successfully");
        setStatusDialogOpen(false);
        setAdminResponse("");
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to update status",
        );
      },
    },
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (concernId) => concernService.deleteConcern(concernId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("concerns");
        queryClient.invalidateQueries("concernDetail");
        toast.success("Concern deleted successfully");
        setDeleteDialogOpen(false);
        setViewDialogOpen(false);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete concern",
        );
      },
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

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };

  const handlePriorityFilterChange = (event) => {
    setPriorityFilter(event.target.value);
    setPage(0);
  };

  const handleRaisedByFilterChange = (event) => {
    setRaisedByFilter(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Concerns data refreshed");
  };

  const handleViewConcern = (concernId) => {
    setSelectedConcern(concernId);
    setViewDialogOpen(true);
    refetchDetail();
  };

  const handleStatusUpdate = () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    if (["Resolved", "Rejected"].includes(newStatus) && !adminResponse.trim()) {
      toast.error(
        "Admin response is required when resolving or rejecting a concern",
      );
      return;
    }

    updateStatusMutation.mutate({
      concernId: selectedConcern,
      data: {
        status: newStatus,
        adminResponse: adminResponse,
      },
    });
  };

  const handleDeleteConcern = () => {
    deleteMutation.mutate(selectedConcern);
  };

  const handleExport = async () => {
    try {
      const exportData = await concernService.getAllConcerns({
        page: 1,
        limit: 1000,
        status: statusFilter,
        category: categoryFilter,
        priority: priorityFilter,
        raisedBy: raisedByFilter,
      });

      const data = exportData.concerns || [];
      const headers = [
        "ID",
        "Subject",
        "Category",
        "Priority",
        "Status",
        "Raised By",
        "Created At",
        "Updated At",
      ];
      let csv = headers.join(",") + "\n";

      data.forEach((row) => {
        csv +=
          [
            row._id,
            `"${row.subject}"`,
            row.category,
            row.priority,
            row.status,
            row.raisedBy,
            new Date(row.createdAt).toISOString(),
            new Date(row.updatedAt).toISOString(),
          ].join(",") + "\n";
      });

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `concerns_export_${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Concerns exported successfully");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const concerns = data?.concerns || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  };

  const getStatusChip = (status) => {
    const statusMap = {
      Open: { label: "Open", color: "warning" },
      InProgress: { label: "In Progress", color: "info" },
      Resolved: { label: "Resolved", color: "success" },
      Rejected: { label: "Rejected", color: "error" },
      Closed: { label: "Closed", color: "default" },
    };
    return (
      statusMap[status] || { label: status || "Unknown", color: "default" }
    );
  };

  const getPriorityChip = (priority) => {
    const priorityMap = {
      Low: { label: "Low", color: "success" },
      Medium: { label: "Medium", color: "warning" },
      High: { label: "High", color: "error" },
      Critical: { label: "Critical", color: "error" },
    };
    return (
      priorityMap[priority] || { label: priority || "Medium", color: "default" }
    );
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      Technical: <CategoryIcon fontSize="small" />,
      Billing: <CategoryIcon fontSize="small" />,
      Service: <CategoryIcon fontSize="small" />,
      Other: <CategoryIcon fontSize="small" />,
    };
    return iconMap[category] || <CategoryIcon fontSize="small" />;
  };

  const getRaisedByIcon = (raisedBy) => {
    return raisedBy === "User" ? (
      <PersonIcon fontSize="small" />
    ) : (
      <StoreIcon fontSize="small" />
    );
  };

  return (
    <>
      <Helmet>
        <title>Concerns | Admin Panel</title>
      </Helmet>

      <Box mb={isMobile ? 2 : 4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          mb={2}
        >
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
            {isMobile ? "Concerns" : "Concerns Management"}
          </Typography>
          <Box display="flex" gap={0.5}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{ mr: 0.5 }}
            >
              {isMobile ? "" : "Export"}
            </Button>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                color="primary"
                size={isMobile ? "small" : "medium"}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 2 : 4}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Total
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {formatNumber(pagination.totalCount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Open
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                color="warning.main"
              >
                {formatNumber(
                  concerns.filter((c) => c.status === "Open").length || 0,
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                In Progress
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                color="info.main"
              >
                {formatNumber(
                  concerns.filter((c) => c.status === "InProgress").length || 0,
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Resolved
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                color="success.main"
              >
                {formatNumber(
                  concerns.filter((c) => c.status === "Resolved").length || 0,
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: isMobile ? 1.5 : 3, mb: isMobile ? 2 : 3 }}>
        <Box display="flex" gap={1.5} flexWrap="wrap">
          <TextField
            placeholder="Search concerns..."
            value={searchTerm}
            onChange={handleSearch}
            size="small"
            sx={{ flex: 1, minWidth: 150 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="InProgress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={handlePriorityFilterChange}
              label="Priority"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Raised By</InputLabel>
            <Select
              value={raisedByFilter}
              onChange={handleRaisedByFilterChange}
              label="Raised By"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Vendor">Vendor</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ alignSelf: "center", ml: "auto" }}
          >
            Showing {concerns.length} of {pagination.totalCount || 0}
          </Typography>
        </Box>
      </Paper>

      {/* Concerns Table */}
      <Paper>
        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Raised By</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {concerns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No concerns found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                concerns.map((concern) => {
                  const statusInfo = getStatusChip(concern.status);
                  const priorityInfo = getPriorityChip(concern.priority);
                  return (
                    <TableRow key={concern._id} hover>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {concern.subject}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={concern.category || "Other"}
                          size="small"
                          variant="outlined"
                          icon={getCategoryIcon(concern.category)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={priorityInfo.label}
                          size="small"
                          color={priorityInfo.color}
                          icon={<FlagIcon fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={concern.raisedBy || "Unknown"}
                          size="small"
                          variant="outlined"
                          icon={getRaisedByIcon(concern.raisedBy)}
                        />
                      </TableCell>
                      <TableCell>{formatDate(concern.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewConcern(concern._id)}
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
          count={pagination.totalCount || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* View Concern Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <MessageIcon color="primary" />
            <Typography variant="h6">Concern Details</Typography>
            {concernDetail?.concern && (
              <Chip
                label={getStatusChip(concernDetail.concern.status).label}
                size="small"
                color={getStatusChip(concernDetail.concern.status).color}
                sx={{ ml: "auto" }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {updateStatusMutation.isLoading ? (
            <LoadingSpinner />
          ) : concernDetail?.concern ? (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Subject
                  </Typography>
                  {console.log(concernDetail)}
                  <Typography variant="body1">
                    {concernDetail.concern.subject}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {concernDetail.concern.description}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Category
                  </Typography>
                  <Typography variant="body2">
                    <Chip
                      label={concernDetail.concern.category || "Other"}
                      size="small"
                      variant="outlined"
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Priority
                  </Typography>
                  <Typography variant="body2">
                    <Chip
                      label={
                        getPriorityChip(concernDetail.concern.priority).label
                      }
                      size="small"
                      color={
                        getPriorityChip(concernDetail.concern.priority).color
                      }
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Raised By
                  </Typography>
                  <Typography variant="body2">
                    <Chip
                      label={concernDetail.concern.raisedBy || "Unknown"}
                      size="small"
                      variant="outlined"
                      icon={getRaisedByIcon(concernDetail.concern.raisedBy)}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body2">
                    {concernDetail.concern.raisedById.name.toUpperCase()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Phone Number
                  </Typography>
                  <Typography variant="body2">
                    {concernDetail.concern.raisedById.phoneNo}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(concernDetail.concern.createdAt, "long")}
                  </Typography>
                </Grid>
                {concernDetail.concern.adminResponse && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: "background.default" }}>
                      <Typography
                        variant="subtitle2"
                        color="secondary"
                        gutterBottom
                      >
                        Admin Response
                      </Typography>
                      <Typography variant="body2">
                        {concernDetail.concern.adminResponse}
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                {concernDetail.concern.resolvedAt && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Resolved on:{" "}
                      {formatDate(concernDetail.concern.resolvedAt, "long")}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setStatusDialogOpen(true);
                  }}
                >
                  Update Status
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Close
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography color="error">
              Failed to load concern details
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">Update Concern Status</Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="InProgress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
            {["Resolved", "Rejected"].includes(newStatus) && (
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Response"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Please provide a response..."
                required
                helperText="Response is required when resolving or rejecting a concern"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setStatusDialogOpen(false);
              setNewStatus("");
              setAdminResponse("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleStatusUpdate}
            disabled={updateStatusMutation.isLoading}
          >
            {updateStatusMutation.isLoading ? "Updating..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Concern</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this concern? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConcern}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConcernsPage;
