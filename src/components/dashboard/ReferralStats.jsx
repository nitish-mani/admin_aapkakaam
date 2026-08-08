import React from "react";
import { Paper, Typography, Box, LinearProgress, Grid } from "@mui/material";
import {
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const ReferralStats = ({ referrals }) => {
  const totalShares =
    typeof referrals?.totalShares === "number" ? referrals.totalShares : 0;

  const completed =
    typeof referrals?.completed === "number" ? referrals.completed : 0;

  const conversionPct =
    typeof referrals?.conversionPct === "number" ? referrals.conversionPct : 0;

  const stats = [
    {
      label: "Total Shares",
      value: totalShares,
      icon: <ShareIcon sx={{ color: "#3f51b5" }} />,
      color: "#3f51b5",
    },
    {
      label: "Completed",
      value: completed,
      icon: <TrendingUpIcon sx={{ color: "#4caf50" }} />,
      color: "#4caf50",
    },
  ];

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Referral Performance
      </Typography>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="h2" fontWeight={700} color="primary">
          {conversionPct}%
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Conversion Rate
        </Typography>
      </Box>

      <Box sx={{ mt: 3 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(conversionPct, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e0e0e0",
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={6} key={index}>
            <Box
              sx={{
                p: 2,
                backgroundColor: `${stat.color}10`,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                {stat.icon}
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {stat.label}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default ReferralStats;
