
import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";

import {
  Alert,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
} from "@mui/material";

import {
  Search as SearchIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Store as StoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Cached as CachedIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  LocationOn as LocationIcon,
  EventAvailable as BookingIcon,
  TouchApp as SelectIcon,
} from "@mui/icons-material";

import { useQuery } from "react-query";
import { toast } from "react-toastify";

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";

import { analyticsService } from "../services/analyticsService";
import LoadingSpinner from "../components/common/LoadingSpinner";

/* ============================================================
   HELPERS
============================================================ */

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value || 0));

const formatPercent = (value) =>
  `${Number(value || 0).toFixed(1)}%`;

const formatDuration = (value) => {
  const ms = Number(value || 0);

  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(2)} sec`;
  }

  return `${Math.round(ms)} ms`;
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

/* ============================================================
   ANALYTICS CARD
============================================================ */

const AnalyticsCard = ({ title, value, subtitle, icon }) => (
  <Card
    sx={{
      height: "100%",
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      transition: "all 0.2s ease",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: 4,
      },
    }}
  >
    <CardContent>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        mb={2}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
        >
          {title}
        </Typography>

        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography variant="h4" fontWeight={800}>
        {value}
      </Typography>

      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
        >
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

/* ============================================================
   SECTION CARD
============================================================ */

const SectionCard = ({ title, subtitle, children, action }) => (
  <Card sx={{ borderRadius: 3, height: "100%" }}>
    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={2}
        mb={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {action}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {children}
    </CardContent>
  </Card>
);

/* ============================================================
   MAIN COMPONENT
============================================================ */

const VendorSearchAnalytics = () => {
  const [days, setDays] = useState("30");
  const [searchBy, setSearchBy] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [pincode, setPincode] = useState("");
  const [platform, setPlatform] = useState("");
  const [cacheHit, setCacheHit] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const filters = useMemo(
    () => ({
      days,
      searchBy,
      type: serviceType.trim(),
      pincode: pincode.trim(),
      platform,
      cacheHit,
    }),
    [days, searchBy, serviceType, pincode, platform, cacheHit]
  );

  /* ==========================================================
     QUERY
  ========================================================== */

  const {
    data: analyticsData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery(
    [
      "vendorSearchAnalytics",
      filters,
      page,
      rowsPerPage,
    ],
    () =>
      analyticsService.getVendorSearchAnalytics({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
      }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onError: (err) => {
        toast.error(
          err?.response?.data?.message ||
            "Failed to load vendor search analytics"
        );
      },
    }
  );

  /* ==========================================================
     RESPONSE DATA
  ========================================================== */

  const summary = analyticsData?.summary || {};
  const cache = analyticsData?.cache || {};

  const dailyTrend = analyticsData?.dailyTrend || [];
  const popularServices = analyticsData?.popularServices || [];
  const popularPincodes = analyticsData?.popularPincodes || [];
  const platforms = analyticsData?.platforms || [];

  const logs = analyticsData?.logs?.data || [];
  const totalLogs = analyticsData?.logs?.total || 0;

  /* ==========================================================
     FILTER HANDLERS
  ========================================================== */

  const resetFilters = () => {
    setDays("30");
    setSearchBy("");
    setServiceType("");
    setPincode("");
    setPlatform("");
    setCacheHit("");
    setPage(0);
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Vendor search analytics refreshed");
    } catch {
      toast.error("Failed to refresh analytics");
    }
  };

  /* ==========================================================
     KPI DATA
  ========================================================== */

  const cards = [
    {
      title: "Total Searches",
      value: formatNumber(summary.totalSearches),
      subtitle: `${formatNumber(summary.userSearches)} user · ${formatNumber(summary.vendorSearches)} vendor`,
      icon: <SearchIcon color="primary" />,
    },
    {
      title: "Unique Searchers",
      value: formatNumber(summary.uniqueActors),
      subtitle: "Distinct user/vendor IDs",
      icon: <PeopleIcon color="primary" />,
    },
    {
      title: "Searches With Results",
      value: formatPercent(summary.resultRate),
      subtitle: `${formatNumber(summary.searchesWithResults)} searches`,
      icon: <CheckCircleIcon color="success" />,
    },
    {
      title: "Zero-Result Searches",
      value: formatPercent(summary.zeroResultRate),
      subtitle: `${formatNumber(summary.zeroResultSearches)} searches`,
      icon: <CancelIcon color="error" />,
    },
    {
      title: "Average Search Time",
      value: formatDuration(summary.avgDurationMs),
      subtitle: "Recorded request duration",
      icon: <SpeedIcon color="primary" />,
    },
    {
      title: "Vendor Selection Rate",
      value: formatPercent(summary.vendorSelectionRate),
      subtitle: `${formatNumber(summary.selectedVendorSearches)} selections`,
      icon: <SelectIcon color="primary" />,
    },
    {
      title: "Searches With Booking",
      value: formatNumber(summary.searchesWithBooking),
      subtitle: `${formatPercent(summary.bookingRate)} of searches`,
      icon: <BookingIcon color="success" />,
    },
    {
      title: "Cache Hit Rate",
      value: formatPercent(cache.hitRate),
      subtitle: `${formatNumber(cache.cacheHits)} cache hits`,
      icon: <CachedIcon color="primary" />,
    },
  ];

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return <LoadingSpinner />;
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <Helmet>
        <title>Vendor Search Analytics | Admin</title>
      </Helmet>

      {/* HEADER */}

      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Vendor Search Analytics
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.5}
            >
              Monitor search demand, vendor availability,
              cache performance and booking conversion.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isFetching}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error?.response?.data?.message ||
            error?.message ||
            "Unable to load analytics. Please try again."}
        </Alert>
      )}

      {isFetching && (
        <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />
      )}

      {/* FILTERS */}

      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            mb={2}
          >
            <AnalyticsIcon color="primary" />

            <Typography variant="h6" fontWeight={700}>
              Search Filters
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Date Range"
                value={days}
                onChange={(e) => {
                  setDays(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="7">Last 7 Days</MenuItem>
                <MenuItem value="30">Last 30 Days</MenuItem>
                <MenuItem value="90">Last 90 Days</MenuItem>
                <MenuItem value="365">Last 365 Days</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Search By"
                value={searchBy}
                onChange={(e) => {
                  setSearchBy(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="User">User</MenuItem>
                <MenuItem value="Vendor">Vendor</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Service Type"
                placeholder="e.g. plumber"
                value={serviceType}
                onChange={(e) => {
                  setServiceType(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPage(0);
                }}
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Platform"
                value={platform}
                onChange={(e) => {
                  setPlatform(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Platforms</MenuItem>

                {platforms.filter(Boolean).map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Cache Status"
                value={cacheHit}
                onChange={(e) => {
                  setCacheHit(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Cache Hit</MenuItem>
                <MenuItem value="false">Cache Miss</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="text"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* SEARCH ANALYTICS */}

      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AnalyticsIcon color="primary" />

          <Typography variant="h6" fontWeight={700}>
            Search Overview
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <AnalyticsCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* SEARCH TREND AND CACHE */}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Daily Search Trend"
            subtitle="Search volume, zero-result searches and linked bookings"
          >
            {dailyTrend.length === 0 ? (
              <Alert severity="info">
                No search analytics available for this period.
              </Alert>
            ) : (
              <Box sx={{ width: "100%", height: 330 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      minTickGap={25}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="searches"
                      name="Searches"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="zeroResults"
                      name="Zero Results"
                      stroke="#dc2626"
                      strokeWidth={2}
                      dot={false}
                    />

                    <Line
                      type="monotone"
                      dataKey="bookings"
                      name="Searches With Booking"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard
            title="Cache Performance"
            subtitle="Search response cache metrics"
          >
            <Typography variant="h3" fontWeight={800}>
              {formatPercent(cache.hitRate)}
            </Typography>

            <Typography color="text.secondary" mb={2}>
              Cache hit rate
            </Typography>

            <LinearProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, Number(cache.hitRate || 0)))}
              sx={{ height: 10, borderRadius: 5, mb: 3 }}
            />

            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  Cache Hits
                </Typography>
                <Typography fontWeight={700}>
                  {formatNumber(cache.cacheHits)}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  Cache Misses
                </Typography>
                <Typography fontWeight={700}>
                  {formatNumber(cache.cacheMisses)}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  Unknown Status
                </Typography>
                <Typography fontWeight={700}>
                  {formatNumber(cache.unknown)}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">
                  Average Duration
                </Typography>
                <Typography fontWeight={700}>
                  {formatDuration(summary.avgDurationMs)}
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* TOP SERVICES */}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Popular Services"
            subtitle="Services with the highest search volume"
          >
            {popularServices.length === 0 ? (
              <Alert severity="info">No service data available.</Alert>
            ) : (
              <Box sx={{ width: "100%", height: 330 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularServices}
                    layout="vertical"
                    margin={{ left: 15, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis type="number" allowDecimals={false} />

                    <YAxis
                      type="category"
                      dataKey="service"
                      width={110}
                      tick={{ fontSize: 11 }}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="searches"
                      name="Searches"
                      fill="#7c3aed"
                      radius={[0, 5, 5, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* TOP PINCODES */}

        <Grid item xs={12} lg={6}>
          <SectionCard
            title="Popular Pincodes"
            subtitle="Locations with the highest search demand"
          >
            <TableContainer sx={{ maxHeight: 330 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Pincode</TableCell>
                    <TableCell align="right">Searches</TableCell>
                    <TableCell align="right">Zero Results</TableCell>
                    <TableCell align="right">Avg. Results</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {popularPincodes.map((item) => (
                    <TableRow key={item.pincode} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <LocationIcon
                            fontSize="small"
                            color="action"
                          />
                          <Typography fontWeight={600}>
                            {item.pincode}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell align="right">
                        {formatNumber(item.searches)}
                      </TableCell>

                      <TableCell align="right">
                        <Chip
                          size="small"
                          color={
                            item.zeroResults > 0 ? "warning" : "success"
                          }
                          label={formatNumber(item.zeroResults)}
                        />
                      </TableCell>

                      <TableCell align="right">
                        {Number(item.avgResults || 0).toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {popularPincodes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No pincode data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
      </Grid>

      {/* RECENT SEARCH EVENTS */}

      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={2}
            flexWrap="wrap"
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Recent Search Events
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Search logs recorded by the analytics worker.
              </Typography>
            </Box>

            <Chip
              variant="outlined"
              label={`${formatNumber(totalLogs)} events`}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Pincode</TableCell>
                  <TableCell align="right">Results</TableCell>
                  <TableCell align="right">Candidates</TableCell>
                  <TableCell>Cache</TableCell>
                  <TableCell align="right">Duration</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Vendor Selected</TableCell>
                  <TableCell>Booking</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.eventId} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDateTime(log.createdAt)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={log.searchBy || "Unknown"}
                        color={
                          log.searchBy === "User"
                            ? "primary"
                            : log.searchBy === "Vendor"
                              ? "secondary"
                              : "default"
                        }
                      />

                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        mt={0.5}
                      >
                        {log.searchById
                          ? String(log.searchById).slice(-6)
                          : "—"}
                      </Typography>
                    </TableCell>

                    <TableCell>{log.type || "—"}</TableCell>

                    <TableCell>{log.pincode || "—"}</TableCell>

                    <TableCell align="right">
                      <Chip
                        size="small"
                        color={
                          Number(log.resultCount) > 0
                            ? "success"
                            : "error"
                        }
                        label={formatNumber(log.resultCount)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {formatNumber(log.candidateCount)}
                    </TableCell>

                    <TableCell>
                      {log.cacheHit === true ? (
                        <Chip
                          size="small"
                          color="success"
                          label="Hit"
                        />
                      ) : log.cacheHit === false ? (
                        <Chip
                          size="small"
                          color="warning"
                          label="Miss"
                        />
                      ) : (
                        <Chip size="small" label="Unknown" />
                      )}
                    </TableCell>

                    <TableCell align="right">
                      {log.durationMs == null
                        ? "—"
                        : formatDuration(log.durationMs)}
                    </TableCell>

                    <TableCell>{log.platform || "—"}</TableCell>

                    <TableCell>
                      {log.selectedVendorId
                        ? String(log.selectedVendorId).slice(-6)
                        : "—"}
                    </TableCell>

                    <TableCell>
                      {log.bookingId ? (
                        <Chip
                          size="small"
                          color="success"
                          label={String(log.bookingId).slice(-6)}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No search events found for these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalLogs}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default VendorSearchAnalytics;
