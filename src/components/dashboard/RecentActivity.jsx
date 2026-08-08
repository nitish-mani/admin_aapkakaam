// src/components/dashboard/RecentActivity.jsx
import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { formatTimeAgo } from "../../utils/formatters";

const getIcon = (type) => {
  switch (type) {
    case "user":
      return <PersonIcon />;
    case "vendor":
      return <StoreIcon />;
    case "booking":
      return <BookmarkIcon />;
    case "transaction":
      return <TrendingUpIcon />;
    case "referral":
      return <ShareIcon />;
    default:
      return <PersonIcon />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "success":
      return "success";
    case "completed":
      return "success";
    case "active":
      return "warning";
    case "pending":
      return "warning";
    case "cancelled":
      return "error";
    case "blocked":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "success":
      return "Success";
    case "completed":
      return "Completed";
    case "active":
      return "Active";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Cancelled";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
};

const RecentActivity = ({ activities = [], onRefresh, loading = false }) => {
  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  // Use provided activities or fallback to empty array
  const displayActivities = activities.length > 0 ? activities : [];

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          Recent Activity
        </Typography>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={handleRefresh} disabled={loading}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {displayActivities.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography color="textSecondary">No recent activity</Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 350, overflow: "auto" }}>
          {displayActivities.map((activity, index) => (
            <React.Fragment key={activity.id || index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.light" }}>
                    {getIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      flexWrap="wrap"
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {activity.action}
                      </Typography>
                      <Chip
                        label={getStatusLabel(activity.status)}
                        size="small"
                        color={getStatusColor(activity.status)}
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        display="block"
                      >
                        {activity.user?.toUpperCase()}
                      </Typography>
                      {activity.details && (
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          {activity.details.toUpperCase()}
                        </Typography>
                      )}
                      <Typography variant="caption" color="textSecondary">
                        {formatTimeAgo(activity.time)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < displayActivities.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default RecentActivity;
