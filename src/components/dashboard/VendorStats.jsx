import React from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
} from "@mui/material";
import {
  Store as StoreIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Money as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
} from "@mui/icons-material";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const VendorStats = ({ vendors }) => {
  if (!vendors) return null;

  const {
    total = 0,
    active = 0,
    blocked = 0,
    earnings = 0,
    commission = 0,
    balance = 0,
    avgRating = 0,
    bookings = { pending: 0, completed: 0, canceled: 0 },
  } = vendors;

  const stats = [
    {
      label: "Active Vendors",
      value: active,
      total: total,
      icon: <StoreIcon sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
    },
    {
      label: "Blocked Vendors",
      value: blocked,
      total: total,
      icon: <CancelIcon sx={{ color: "#f44336" }} />,
      color: "#f44336",
    },
    {
      label: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: <StarIcon sx={{ color: "#ff9800" }} />,
      color: "#ff9800",
      suffix: "★",
    },
    {
      label: "Total Earnings",
      value: formatCurrency(earnings),
      icon: <MoneyIcon sx={{ color: "#3f51b5" }} />,
      color: "#3f51b5",
    },
  ];

  const bookingStats = [
    {
      label: "Completed",
      value: bookings.completed || 0,
      color: "#4caf50",
      icon: <CheckCircleIcon />,
    },
    {
      label: "Pending",
      value: bookings.pending || 0,
      color: "#ff9800",
      icon: <PendingIcon />,
    },
    {
      label: "Canceled",
      value: bookings.canceled || 0,
      color: "#f44336",
      icon: <CancelIcon />,
    },
  ];

  const totalBookings =
    (bookings.completed || 0) +
    (bookings.pending || 0) +
    (bookings.canceled || 0);

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <StoreIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Vendor Performance
        </Typography>
        <Chip
          label={`${formatNumber(total)} Vendors`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid item xs={6} key={index}>
            <Box
              sx={{
                p: 1.5,
                backgroundColor: `${stat.color}10`,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={0.5}
              >
                {stat.icon}
                <Typography variant="h6" fontWeight={700}>
                  {stat.value}
                  {stat.suffix || ""}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {stat.label}
              </Typography>
              {stat.total !== undefined && stat.total > 0 && (
                <LinearProgress
                  variant="determinate"
                  value={(stat.value / stat.total) * 100}
                  sx={{ mt: 1, height: 4, borderRadius: 2 }}
                />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box mt={2}>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Booking Stats
        </Typography>
        <Grid container spacing={1}>
          {bookingStats.map((stat, index) => (
            <Grid item xs={4} key={index}>
              <Box textAlign="center">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={0.5}
                >
                  {stat.icon}
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={stat.color}
                  >
                    {formatNumber(stat.value)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        {totalBookings > 0 && (
          <Box mt={1}>
            <LinearProgress
              variant="determinate"
              value={((bookings.completed || 0) / totalBookings) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="textSecondary">
              {(((bookings.completed || 0) / totalBookings) * 100).toFixed(1)}%
              completion rate
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        mt={2}
        display="flex"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Chip
          label={`Commission: ${formatCurrency(commission)}`}
          size="small"
          variant="outlined"
        />
        <Chip
          label={`Balance: ${formatCurrency(balance)}`}
          size="small"
          variant="outlined"
        />
      </Box>
    </Paper>
  );
};

export default VendorStats;
