// src/pages/VendorsPage.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
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
  Divider,
  Badge,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [detailTab, setDetailTab] = useState(0);

  // ============================================================
  // QUERY: Vendor List (with pagination, filters, sorting)
  // ============================================================
  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
  } = useQuery(
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
      analyticsService.getVendorList({
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
      staleTime: 30000, // 30 seconds
    },
  );
  // ============================================================
  // QUERY: Vendor Detail (single vendor analytics)
  // ============================================================
  const {
    data: detailData,
    isLoading: detailLoading,
    refetch: refetchDetail,
    isError: detailError,
  } = useQuery(
    ["vendorDetail", selectedVendor],
    () =>
      selectedVendor ? analyticsService.getVendorDetail(selectedVendor) : null,
    {
      enabled: !!selectedVendor,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      onError: (error) => {
        toast.error("Failed to load vendor details");
        console.error("Vendor detail error:", error);
      },
    },
  );

  // ============================================================
  // HANDLERS
  // ============================================================
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
    refetchList();
    toast.success("Vendor data refreshed");
  };

  const handleViewVendor = (vendorId) => {
    setSelectedVendor(vendorId);
    setViewDialogOpen(true);
    // Refetch detail data when dialog opens
    setTimeout(() => refetchDetail(), 100);
  };

  const handleCloseDialog = () => {
    setViewDialogOpen(false);
    setSelectedVendor(null);
    setDetailTab(0);
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

  // ============================================================
  // HELPERS
  // ============================================================
  const isLeaveCurrent = (leave) => {
    const now = new Date();
    const from = new Date(leave.from);
    const to = new Date(leave.to);
    return leave.status === "active" && from <= now && to >= now;
  };

  const isLeaveUpcoming = (leave) => {
    const now = new Date();
    const from = new Date(leave.from);
    return leave.status === "active" && from > now;
  };

  // ============================================================
  // DATA EXTRACTION
  // ============================================================
  const isLoading = listLoading;

  // ============================================================
  // DATA FROM API
  // ============================================================

  // getVendorAnalytics() returns response.data
  //
  // Therefore:
  //
  // listData
  //   ├── success
  //   └── data
  //        ├── vendors
  //        ├── typeDistribution
  //        ├── pagination
  //        ├── performance
  //        └── ...
  //
  // ============================================================

  const apiData = listData?.data ?? {};

  // ============================================================
  // VENDORS
  // ============================================================

  const rawVendors = Array.isArray(apiData.vendors) ? apiData.vendors : [];

  // ============================================================
  // NORMALIZE VENDORS
  // ============================================================

  const vendors = rawVendors.map((vendor) => {
    const types = Array.isArray(vendor?.type)
      ? vendor.type
      : vendor?.type
        ? [vendor.type]
        : [];

    const wageRates = Array.isArray(vendor?.wageRate)
      ? vendor.wageRate
      : vendor?.wageRate !== undefined && vendor?.wageRate !== null
        ? [vendor.wageRate]
        : [];

    const wageRateTypes = Array.isArray(vendor?.wageRateType)
      ? vendor.wageRateType
      : vendor?.wageRateType
        ? [vendor.wageRateType]
        : [];

    const existingJobs = Array.isArray(vendor?.jobs) ? vendor.jobs : [];

    const jobCount = Math.max(
      types.length,
      wageRates.length,
      wageRateTypes.length,
      existingJobs.length,
    );

    const jobs = Array.from({ length: jobCount }, (_, index) => {
      const oldJob = existingJobs[index] || {};

      return {
        type: types[index] ?? oldJob.type ?? "",

        wageRate:
          wageRates[index] !== undefined
            ? Number(wageRates[index])
            : oldJob.wageRate !== undefined
              ? Number(oldJob.wageRate)
              : 0,

        wageRateType: wageRateTypes[index] ?? oldJob.wageRateType ?? "",
      };
    }).filter((job) => job.type || job.wageRate || job.wageRateType);

    return {
      ...vendor,

      type: types,

      wageRate: wageRates,

      wageRateType: wageRateTypes,

      jobs,
    };
  });

  // ============================================================
  // TYPE DISTRIBUTION
  // ============================================================

  const typeDistribution = Array.isArray(apiData.typeDistribution)
    ? apiData.typeDistribution
        .map((item) => ({
          ...item,

          type: item?.type ?? item?._id ?? "Other",

          vendorCount: Number(item?.vendorCount ?? item?.count ?? 0),
        }))
        .filter((item) => item.type && item.vendorCount > 0)
    : [];

  // ============================================================
  // PAGINATION
  // ============================================================

  const pagination = apiData.pagination || {};

  const totalCount = Number(pagination.total || 0);

  // ============================================================
  // PERFORMANCE
  // ============================================================

  const performance = apiData.performance || {};

  // ============================================================
  // LEAVE STATS
  // ============================================================

  const leaveStats = apiData.leaveStats || {};

  // ============================================================
  // TOTALS
  // ============================================================

  const totals = apiData.totals || {};

  // ============================================================
  // PINCODE DISTRIBUTION
  // ============================================================

  // ============================================================
  // PINCODE DISTRIBUTION
  // ============================================================

  const rawPincodeDistribution = Array.isArray(apiData?.pincodeDistribution)
    ? apiData.pincodeDistribution
    : [];

  const pincodeDistribution = rawPincodeDistribution
    .map((item, index) => {
      const pincode =
        item?.pincode ??
        item?._id ??
        item?.pinCode ??
        item?.postalCode ??
        item?.code ??
        "";

      const count = Number(
        item?.vendorCount ?? item?.count ?? item?.vendors ?? item?.total ?? 0,
      );

      return {
        pincode: String(pincode).trim(),
        vendorCount: Number.isFinite(count) ? count : 0,
        original: item,
        index,
      };
    })
    .filter((item) => item.pincode && item.vendorCount > 0)
    .sort((a, b) => b.vendorCount - a.vendorCount);

  console.log("========== PINCODE DISTRIBUTION ==========");

  console.log("RAW PINCODES:", rawPincodeDistribution);

  console.table(
    pincodeDistribution.map((item) => ({
      pincode: item.pincode,
      vendorCount: item.vendorCount,
    })),
  );

  console.log("==========================================");

  // ============================================================
  // BOOKING TRENDS
  // ============================================================

  const bookingTrends = Array.isArray(apiData.bookingTrends)
    ? apiData.bookingTrends
    : [];

  // ============================================================
  // GROWTH
  // ============================================================

  const growth = Array.isArray(apiData.growth) ? apiData.growth : [];

  // Extract vendor detail data
  const vendorDetail = detailData?.data || null;

  console.log(vendors);

  // Colors for charts
  const COLORS = [
    "#3f51b5",
    "#f50057",
    "#ff9800",
    "#4caf50",
    "#2196f3",
    "#9c27b0",
    "#00bcd4",
    "#8bc34a",
  ];

  // ============================================================
  // RENDER
  // ============================================================
  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>Vendors | Admin Panel</title>
      </Helmet>

      {/* Header */}
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          mb={2}
        >
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
            {isMobile ? "Vendors" : "Vendor Analytics"}
          </Typography>
          <Box display="flex" gap={0.5}>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
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
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Total Vendors
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {formatNumber(totals?.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Active Vendors
              </Typography>
              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={700}
                color="success.main"
              >
                {formatNumber(totals?.active || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Avg Rating
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {performance?.avgRating?.toFixed(1) || 0} ★
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
              <Typography color="textSecondary" variant="caption">
                Total Earnings
              </Typography>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                {formatCurrency(performance?.totalEarnings || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave Stats Cards (if available) */}
      {leaveStats && Object.keys(leaveStats).length > 0 && (
        <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 2 : 4}>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography color="textSecondary" variant="caption">
                  Total Leaves
                </Typography>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight={700}
                  color="info.main"
                >
                  {formatNumber(leaveStats?.totalLeaves || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography color="textSecondary" variant="caption">
                  Active Leaves
                </Typography>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight={700}
                  color="warning.main"
                >
                  {formatNumber(leaveStats?.activeLeaves || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography color="textSecondary" variant="caption">
                  Current Active
                </Typography>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight={700}
                  color="error.main"
                >
                  {formatNumber(leaveStats?.currentActiveLeaves || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card>
              <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                <Typography color="textSecondary" variant="caption">
                  Cancelled Leaves
                </Typography>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  fontWeight={700}
                  color="text.secondary"
                >
                  {formatNumber(leaveStats?.cancelledLeaves || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 2 : 4}>
        {/* Vendor Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 1.5 : 3, height: "100%" }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              fontWeight={600}
              gutterBottom
            >
              Vendor Type Distribution
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "100%",
                minHeight: 280,
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              {/* Pie Chart */}
              <Box
                sx={{
                  width: { xs: "80%", sm: 260 },
                  minWidth: { xs: 150, sm: 260 },
                  height: 260,
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      dataKey="vendorCount"
                      nameKey="type"
                      labelLine={false}
                    >
                      {(Array.isArray(typeDistribution)
                        ? typeDistribution
                        : []
                      ).map((entry, index) => (
                        <Cell
                          key={`cell-${entry?.type || entry?._id || index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value, name, props) => [
                        value,
                        props?.payload?.type || "Other",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              {/* Scrollable Labels */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  maxHeight: 260,
                  overflowY: "auto",
                  overflowX: "hidden",
                  pr: 1,
                  width: "100%",
                  "&::-webkit-scrollbar": {
                    width: 6,
                  },
                  "&::-webkit-scrollbar-thumb": {
                    borderRadius: 3,
                    backgroundColor: "rgba(0,0,0,0.25)",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                  },
                  scrollbarWidth: "thin",
                }}
              >
                {(Array.isArray(typeDistribution) ? typeDistribution : []).map(
                  (entry, index) => {
                    const name = entry?.type || entry?._id || "Other";
                    const count = Number(
                      entry?.vendorCount ?? entry?.count ?? 0,
                    );

                    const total = typeDistribution.reduce(
                      (sum, item) =>
                        sum + Number(item?.vendorCount ?? item?.count ?? 0),
                      0,
                    );

                    const percentage =
                      total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

                    return (
                      <Box
                        key={`legend-${name}-${index}`}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1,
                          mb: 1,
                          p: 1,
                          borderRadius: 1.5,
                          backgroundColor: "action.hover",
                          transition: "background-color 0.2s ease",
                          "&:hover": {
                            backgroundColor: "action.selected",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <Box
                            sx={{
                              width: 11,
                              height: 11,
                              minWidth: 11,
                              borderRadius: "50%",
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textTransform: "capitalize",
                            }}
                            title={name}
                          >
                            {name}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            flexShrink: 0,
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {count}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({percentage}%)
                          </Typography>
                        </Box>
                      </Box>
                    );
                  },
                )}

                {(!Array.isArray(typeDistribution) ||
                  typeDistribution.length === 0) && (
                  <Box
                    sx={{
                      height: 240,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No vendor type data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Vendor Performance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 1.5 : 3, height: "100%" }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              fontWeight={600}
              gutterBottom
            >
              Vendor Performance
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  textAlign="center"
                  p={2}
                  bgcolor="#e3f2fd"
                  borderRadius={2}
                  sx={{ height: "100%" }}
                >
                  <Typography variant={isMobile ? "h6" : "h5"} color="primary">
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
                  sx={{ height: "100%" }}
                >
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    color="success.main"
                  >
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
                  sx={{ height: "100%" }}
                >
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    color="warning.main"
                  >
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
                  sx={{ height: "100%" }}
                >
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    color="error.main"
                  >
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
      <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 2 : 4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 1.5 : 3 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              fontWeight={600}
              gutterBottom
            >
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
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    color="success.main"
                  >
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
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    color="warning.main"
                  >
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
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    color="error.main"
                  >
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
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: isMobile ? 1.5 : 3 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              fontWeight={600}
              gutterBottom
            >
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
                  {pincodeDistribution.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <LocationIcon
                            sx={{
                              fontSize: 36,
                              color: "text.disabled",
                            }}
                          />

                          <Typography variant="body2" color="text.secondary">
                            No pincode data available
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    pincodeDistribution.slice(0, 5).map((item, index) => (
                      <TableRow key={`${item.pincode}-${index}`} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor:
                                  index === 0 ? "primary.main" : "action.hover",
                                color: index === 0 ? "white" : "text.secondary",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {index + 1}
                            </Box>

                            <LocationIcon fontSize="small" color="action" />

                            <Typography
                              variant="body2"
                              fontWeight={index === 0 ? 700 : 500}
                            >
                              {item.pincode}
                            </Typography>
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Chip
                            label={`${item.vendorCount} vendor${
                              item.vendorCount === 1 ? "" : "s"
                            }`}
                            size="small"
                            color={index === 0 ? "primary" : "default"}
                            variant={index === 0 ? "filled" : "outlined"}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: isMobile ? 1.5 : 3, mb: isMobile ? 2 : 3 }}>
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search vendors..."
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
              onChange={handleStatusChange}
              label="Status"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={handleTypeChange} label="Type">
              <MenuItem value="all">All</MenuItem>
              {typeDistribution.map((item) => (
                <MenuItem key={item.type} value={item.type}>
                  {String(item.type).charAt(0).toUpperCase() +
                    String(item.type).slice(1)}{" "}
                  ({item.vendorCount})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
            sx={{ alignSelf: "center", ml: "auto", whiteSpace: "nowrap" }}
          >
            Showing {vendors.length} of {totalCount}
          </Typography>
        </Box>
      </Paper>

      {/* Vendors Table */}
      <Paper>
        <TableContainer>
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell>Vendor</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Earnings</TableCell>
                <TableCell>Bookings</TableCell>
                <TableCell>Orders</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Shares</TableCell>
                <TableCell>Leaves</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      {searchTerm
                        ? `No vendors found matching "${searchTerm}"`
                        : "No vendors found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => {
                  const activeLeaves = vendor.leaveInfo?.activeLeaveCount || 0;
                  const hasActiveLeaves = activeLeaves > 0;
                  const currentActive =
                    vendor.leaveInfo?.leaves?.filter((leave) =>
                      isLeaveCurrent(leave),
                    ).length || 0;

                  return (
                    <TableRow key={vendor._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: isMobile ? 28 : 32,
                              height: isMobile ? 28 : 32,
                              bgcolor: "secondary.main",
                              fontSize: isMobile ? 12 : 14,
                            }}
                          >
                            {vendor.name?.charAt(0).toUpperCase() || "V"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              noWrap
                              sx={{ maxWidth: isMobile ? 80 : 120 }}
                            >
                              {vendor.name?.toUpperCase() || "Unknown"}
                            </Typography>
                            {!isMobile && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {vendor.phoneNo || "No phone"}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            maxWidth: 300,
                          }}
                        >
                          {vendor.jobs?.length > 0 ? (
                            vendor.jobs.map((job, index) => (
                              <Tooltip
                                key={`${vendor._id}-job-${index}`}
                                title={
                                  job.wageRate !== undefined &&
                                  job.wageRate !== null
                                    ? `₹${Number(job.wageRate).toLocaleString("en-IN")}${job.wageRateType ? ` / ${job.wageRateType}` : ""}`
                                    : job.type || "General"
                                }
                              >
                                <Chip
                                  label={job.type || "General"}
                                  size="small"
                                  variant="outlined"
                                />
                              </Tooltip>
                            ))
                          ) : (
                            <Chip
                              label="General"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
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
                        {vendor.isVerified && !isMobile && (
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
                          <StarIcon
                            sx={{
                              fontSize: isMobile ? 14 : 16,
                              color: "#ff9800",
                            }}
                          />
                          <Typography variant="body2">
                            {(vendor.rating || 0).toFixed(1)}
                          </Typography>
                          {!isMobile && (
                            <Typography variant="caption" color="textSecondary">
                              ({vendor.ratingCount || 0})
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(vendor.earning?.toFixed(2) || 0)}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatNumber(vendor.bookingCountVendor || 0)}
                          </Typography>
                          {!isMobile && (
                            <Typography variant="caption" color="textSecondary">
                              ✓{vendor.completedVendor || 0} ✗
                              {vendor.canceledVendor || 0}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {formatNumber(vendor.bookingCount || 0)}
                          </Typography>
                          {!isMobile && (
                            <Typography variant="caption" color="textSecondary">
                              ✓{vendor.completed || 0} ✗{vendor.canceled || 0}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(vendor.balance?.toFixed(2) || 0)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatNumber(vendor.shareCount || 0)}
                          size="small"
                          variant="outlined"
                          icon={<ShareIcon fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        {hasActiveLeaves ? (
                          <Badge
                            badgeContent={currentActive || activeLeaves}
                            color={currentActive > 0 ? "error" : "warning"}
                          >
                            <Chip
                              label={`${activeLeaves} active`}
                              size="small"
                              color={currentActive > 0 ? "error" : "warning"}
                              icon={<CalendarIcon fontSize="small" />}
                            />
                          </Badge>
                        ) : (
                          <Chip
                            label="No leaves"
                            size="small"
                            variant="outlined"
                          />
                        )}
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
                  );
                })
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
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <StoreIcon color="primary" />
            <Typography variant="h6">Vendor Details</Typography>
            {vendorDetail?.vendor && (
              <Chip
                label={vendorDetail.vendor.status || "Active"}
                size="small"
                color={
                  vendorDetail.vendor.status === "active" ? "success" : "error"
                }
                sx={{ ml: "auto" }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <LoadingSpinner />
          ) : detailError ? (
            <Typography color="error" align="center" sx={{ py: 4 }}>
              Failed to load vendor details. Please try again.
            </Typography>
          ) : vendorDetail ? (
            <Box>
              {/* Vendor Info */}
              <Grid container spacing={2} mb={3}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{ width: 56, height: 56, bgcolor: "secondary.main" }}
                    >
                      {vendorDetail.vendor?.name?.charAt(0).toUpperCase() ||
                        "V"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {vendorDetail.vendor?.name?.toUpperCase()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {vendorDetail.vendor?.phoneNo || "No phone"}
                      </Typography>
                      <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                        {(Array.isArray(vendorDetail.vendor?.jobs)
                          ? vendorDetail.vendor.jobs
                          : (Array.isArray(vendorDetail.vendor?.type)
                              ? vendorDetail.vendor.type
                              : vendorDetail.vendor?.type
                                ? [vendorDetail.vendor.type]
                                : []
                            ).map((jobType, index) => ({
                              type: jobType,
                              wageRate: vendorDetail.vendor?.wageRate?.[index],
                              wageRateType:
                                vendorDetail.vendor?.wageRateType?.[index],
                            }))
                        ).map((job, index) => (
                          <Chip
                            key={`detail-job-${index}`}
                            size="small"
                            variant="outlined"
                            label={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.6,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {job.type || "General"}
                                </Typography>

                                {job.wageRate !== undefined &&
                                  job.wageRate !== null && (
                                    <>
                                      <Typography
                                        component="span"
                                        sx={{
                                          fontSize: 11,
                                          fontWeight: 700,
                                          color: "success.main",
                                        }}
                                      >
                                        • ₹
                                        {Number(job.wageRate).toLocaleString(
                                          "en-IN",
                                        )}
                                      </Typography>

                                      {job.wageRateType && (
                                        <Typography
                                          component="span"
                                          sx={{
                                            fontSize: 10,
                                            color: "text.secondary",
                                          }}
                                        >
                                          / {job.wageRateType}
                                        </Typography>
                                      )}
                                    </>
                                  )}
                              </Box>
                            }
                            title={
                              job.wageRate !== undefined &&
                              job.wageRate !== null
                                ? `₹${Number(job.wageRate).toLocaleString(
                                    "en-IN",
                                  )}${
                                    job.wageRateType
                                      ? ` / ${job.wageRateType}`
                                      : ""
                                  }`
                                : ""
                            }
                            sx={{
                              height: 32,
                              borderRadius: "9px",
                              whiteSpace: "nowrap",
                              maxWidth: "100%",
                              borderColor: "rgba(63,81,181,0.2)",
                              backgroundColor: "rgba(63,81,181,0.05)",

                              "& .MuiChip-label": {
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                px: 1.2,
                              },

                              "&:hover": {
                                borderColor: "primary.main",
                                backgroundColor: "rgba(63,81,181,0.1)",
                              },
                            }}
                          />
                        ))}
                        {vendorDetail.vendor?.isVerified && (
                          <Chip label="Verified" size="small" color="success" />
                        )}
                        <Chip
                          icon={<StarIcon />}
                          label={`${vendorDetail.vendor?.rating?.toFixed(1) || 0} ★ (${vendorDetail.vendor?.ratingCount || 0} reviews)`}
                          size="small"
                          variant="outlined"
                        />
                        {vendorDetail.vendor?.pincode && (
                          <Chip
                            icon={<LocationIcon />}
                            label={`Pincode: ${vendorDetail.vendor.pincode}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Complete service and wage-rate information
              {(vendorDetail.vendor?.jobs?.length > 0 ||
                (Array.isArray(vendorDetail.vendor?.type) &&
                  vendorDetail.vendor.type.length > 0)) && (
                <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Services & Wage Rates
                  </Typography>
                  <Grid container spacing={1}>
                    {(Array.isArray(vendorDetail.vendor?.jobs)
                      ? vendorDetail.vendor.jobs
                      : vendorDetail.vendor.type.map((jobType, index) => ({
                          type: jobType,
                          wageRate: vendorDetail.vendor?.wageRate?.[index],
                          wageRateType:
                            vendorDetail.vendor?.wageRateType?.[index],
                        }))
                    ).map((job, index) => (
                      <Grid item xs={12} sm={6} key={`detail-rate-${index}`}>
                        <Box
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            bgcolor: "action.hover",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ textTransform: "capitalize" }}
                            >
                              {job.type || "General"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {job.wageRateType || "Rate"}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="primary"
                          >
                            {job.wageRate !== undefined && job.wageRate !== null
                              ? `₹${Number(job.wageRate).toLocaleString("en-IN")}`
                              : "—"}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )} */}

              <Tabs
                value={detailTab}
                onChange={(e, v) => setDetailTab(v)}
                sx={{ mb: 2 }}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
              >
                <Tab label="Overview" />
                <Tab label="Bookings" />
                <Tab label="Revenue" />
                <Tab label="Stats" />
                <Tab
                  label="Leaves"
                  icon={<CalendarIcon />}
                  iconPosition="start"
                />
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
                          {formatNumber(vendorDetail.bookings?.total || 0)}
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
                          {formatNumber(vendorDetail.bookings?.completed || 0)}
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
                          {formatNumber(vendorDetail.bookings?.active || 0)}
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
                          {formatNumber(vendorDetail.bookings?.cancelled || 0)}
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
                            vendorDetail.revenue?.totalRevenue || 0,
                          )}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatNumber(
                            vendorDetail.revenue?.transactionCount || 0,
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
                      <BarChart data={vendorDetail.bookings?.timeline || []}>
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
                            {formatNumber(vendorDetail.bookings?.byUser || 0)}
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
                            {formatNumber(vendorDetail.bookings?.byVendor || 0)}
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
                            {vendorDetail.vendor?.rating?.toFixed(1) || 0} ★
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
                              vendorDetail.revenue?.totalRevenue || 0,
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
                              vendorDetail.revenue?.avgOrderValue || 0,
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
                              vendorDetail.revenue?.totalDiscounts || 0,
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
                            {formatNumber(vendorDetail.referrals?.total || 0)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {vendorDetail.referrals?.completed || 0} completed
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
                                vendorDetail.vendor?.bookingStats
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
                                vendorDetail.vendor?.bookingStats?.completed ||
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
                                vendorDetail.vendor?.bookingStats?.canceled ||
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
                          Vendor-Facing Bookings
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Total
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(
                                vendorDetail.vendor?.bookingStats
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
                                vendorDetail.vendor?.bookingStats
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
                                vendorDetail.vendor?.bookingStats
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
                                vendorDetail.vendor?.shareCount || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Completed
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              {formatNumber(
                                vendorDetail.vendor?.bookingStats
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
                                vendorDetail.vendor?.bookingStats
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
                                vendorDetail.vendor?.earning || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Commission
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                vendorDetail.vendor?.commission || 0,
                              )}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="textSecondary">
                              Balance
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(
                                vendorDetail.vendor?.balance || 0,
                              )}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Leaves Tab */}
              {detailTab === 4 && (
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Leave Information
                    </Typography>
                    {vendorDetail.leaves?.data?.length > 0 && (
                      <Chip
                        label={`${vendorDetail.leaves.data.length} total`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {vendorDetail.leaves?.stats && (
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      <Grid item xs={3}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#fff3e0" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            Total
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {vendorDetail.leaves.stats.total || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#e8f5e9" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            Active
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="success.main"
                          >
                            {vendorDetail.leaves.stats.active || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#fce4ec" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            Current
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="error.main"
                          >
                            {vendorDetail.leaves.stats.currentActive || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={3}>
                        <Paper
                          sx={{ p: 1, textAlign: "center", bgcolor: "#f3e5f5" }}
                        >
                          <Typography variant="caption" color="textSecondary">
                            Upcoming
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="warning.main"
                          >
                            {vendorDetail.leaves?.upcoming?.length || 0}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {vendorDetail.leaves?.data?.length > 0 ? (
                    <>
                      <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 600 }}>
                                From
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>To</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Duration
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Reason
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>
                                Status
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {vendorDetail.leaves.data.map((leave, index) => {
                              const now = new Date();
                              const from = new Date(leave.from);
                              const to = new Date(leave.to);
                              const isCurrent =
                                leave.status === "active" &&
                                from <= now &&
                                to >= now;
                              const isUpcoming =
                                leave.status === "active" && from > now;
                              const isPast =
                                leave.status === "active" && to < now;

                              const durationDays =
                                Math.ceil((to - from) / (1000 * 60 * 60 * 24)) +
                                1;

                              let statusLabel = leave.status;
                              let chipColor = "default";

                              if (isCurrent) {
                                statusLabel = "● Current";
                                chipColor = "error";
                              } else if (isUpcoming) {
                                statusLabel = "⏳ Upcoming";
                                chipColor = "warning";
                              } else if (isPast && leave.status === "active") {
                                statusLabel = "✓ Expired";
                                chipColor = "default";
                              } else if (leave.status === "cancelled") {
                                statusLabel = "✕ Cancelled";
                                chipColor = "default";
                              }

                              return (
                                <TableRow
                                  key={index}
                                  hover
                                  sx={{
                                    backgroundColor: isCurrent
                                      ? "#fff3e0"
                                      : isUpcoming
                                        ? "#e3f2fd"
                                        : "inherit",
                                    "&:hover": {
                                      backgroundColor: isCurrent
                                        ? "#ffe0b2"
                                        : isUpcoming
                                          ? "#bbdefb"
                                          : "action.hover",
                                    },
                                  }}
                                >
                                  <TableCell>
                                    {formatDate(leave.from)}
                                  </TableCell>
                                  <TableCell>{formatDate(leave.to)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={`${durationDays} day${durationDays > 1 ? "s" : ""}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: "0.65rem" }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip
                                      title={
                                        leave.reason || "No reason provided"
                                      }
                                    >
                                      <Typography
                                        variant="body2"
                                        noWrap
                                        sx={{ maxWidth: 120 }}
                                      >
                                        {leave.reason || "N/A"}
                                      </Typography>
                                    </Tooltip>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={statusLabel}
                                      size="small"
                                      color={chipColor}
                                      sx={{
                                        fontWeight:
                                          isCurrent || isUpcoming ? 600 : 400,
                                        "& .MuiChip-label": {
                                          fontSize: "0.7rem",
                                        },
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box
                        sx={{
                          mt: 2,
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "error.main",
                            }}
                          />
                          <Typography variant="caption">
                            Current Leave
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "warning.main",
                            }}
                          />
                          <Typography variant="caption">
                            Upcoming Leave
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "success.main",
                            }}
                          />
                          <Typography variant="caption">
                            Active Leave
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              bgcolor: "grey.400",
                            }}
                          />
                          <Typography variant="caption">
                            Expired/Cancelled
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <CalendarIcon
                        sx={{ fontSize: 48, color: "action.disabled", mb: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        No leave records found for this vendor
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        This vendor has not taken any leave yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Typography color="error" align="center" sx={{ py: 4 }}>
              No vendor data available
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VendorsPage;
