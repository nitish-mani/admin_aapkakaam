import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
} from "@mui/material";
import {
  People as PeopleIcon,
  Store as StoreIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { formatCurrency, formatNumber } from "../../utils/formatters";

const StatCard = ({ title, value, icon, color, subtitle, progress }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1}>
            <Typography
              color="textSecondary"
              variant="caption"
              fontWeight={500}
              gutterBottom
            >
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
            {progress !== undefined && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="textSecondary">
                  {progress.toFixed(0)}% completion
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: "12px",
              padding: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 48,
            }}
          >
            {React.cloneElement(icon, { sx: { color, fontSize: 28 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const StatCards = ({ totals, bookings, revenue, referrals }) => {
  const stats = [
    {
      title: "Total Users",
      value: formatNumber(totals?.users || 0),
      icon: <PeopleIcon />,
      color: "#3f51b5",
    },
    {
      title: "Total Vendors",
      value: formatNumber(totals?.vendors || 0),
      icon: <StoreIcon />,
      color: "#f50057",
    },
    {
      title: "Total Bookings",
      value: formatNumber(totals?.bookings || 0),
      icon: <BookmarkIcon />,
      color: "#ff9800",
      subtitle: `${formatNumber(bookings?.today || 0)} today`,
      progress: bookings?.completionRate || 0,
    },
    {
      title: "GMV (This Month)",
      value: formatCurrency(revenue?.gmvThisMonth || 0),
      icon: <TrendingUpIcon />,
      color: "#4caf50",
      subtitle: `${formatNumber(revenue?.transactionsThisMonth || 0)} transactions`,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} lg={3} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatCards;
