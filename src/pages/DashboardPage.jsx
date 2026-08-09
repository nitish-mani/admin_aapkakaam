// src/pages/DashboardPage.jsx
import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, IconButton, Tooltip } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useQuery } from "react-query";
import { analyticsService } from "../services/analyticsService";
import StatCards from "../components/dashboard/StatCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import BookingChart from "../components/dashboard/BookingChart";
import ReferralStats from "../components/dashboard/ReferralStats";
import VendorStats from "../components/dashboard/VendorStats";
import RecentActivity from "../components/dashboard/RecentActivity";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const DashboardPage = () => {
  const { admin } = useAuth();

  const { data, isLoading, error, refetch } = useQuery(
    "dashboard",
    () => analyticsService.getDashboard(),
    {
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  );

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return <Typography color="error">Failed to load dashboard data</Typography>;

  const dashboardData = data?.data || {};
  const {
    totals,
    bookings,
    revenue,
    referrals,
    vendors,
    recentActivities,
    generatedAt,
  } = dashboardData;
  const activeUsers = admin?.totalUser || totals?.users || 0;

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin Panel</title>
      </Helmet>

      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4" fontWeight={700}>
            Dashboard Overview
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {generatedAt && (
          <Typography variant="caption" color="textSecondary">
            Last updated:{" "}
            {new Date(generatedAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            IST
          </Typography>
        )}
      </Box>

      {/* Stats Cards */}
      <Box mb={4}>
        <StatCards
          totals={{
            ...totals,
          }}
          bookings={bookings}
          revenue={revenue}
          referrals={referrals}
          vendors={vendors}
        />
      </Box>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <RevenueChart revenue={revenue} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <BookingChart bookings={vendors.bookings} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <VendorStats vendors={vendors} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <ReferralStats referrals={referrals} />
        </Grid>
        <Grid item xs={12} lg={12}>
          <RecentActivity
            activities={recentActivities}
            onRefresh={handleRefresh}
            loading={isLoading}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardPage;
