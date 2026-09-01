// src/pages/SystemStatusPage.jsx

import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";

import {
  Refresh as RefreshIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Dns as ServerIcon,
  Speed as SpeedIcon,
  AccessTime as AccessTimeIcon,
  Dataset as DatabaseIcon,
  NetworkCheck as NetworkIcon,
  Terminal as TerminalIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningIcon,
  ErrorOutline as ErrorIcon,
  Wifi as WifiIcon,
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  RestartAlt as RestartIcon,
} from "@mui/icons-material";

import { useQuery, useMutation, useQueryClient } from "react-query";
import { toast } from "react-toastify";

import systemService from "../services/systemService";
import LoadingSpinner from "../components/common/LoadingSpinner";

const formatBytes = (bytes = 0) => {
  if (!bytes || bytes <= 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${sizes[index]}`;
};

const formatUptime = (seconds = 0) => {
  if (!seconds) return "0m";

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);

  parts.push(`${minutes}m`);

  return parts.join(" ");
};

const getStatusColor = (percentage = 0) => {
  if (percentage >= 90) return "error";
  if (percentage >= 75) return "warning";

  return "success";
};

const getHealthConfig = (status) => {
  switch (status) {
    case "healthy":
      return {
        label: "System Healthy",
        color: "success",
        icon: <CheckCircleIcon />,
      };

    case "warning":
      return {
        label: "System Warning",
        color: "warning",
        icon: <WarningIcon />,
      };

    case "critical":
      return {
        label: "System Critical",
        color: "error",
        icon: <ErrorIcon />,
      };

    default:
      return {
        label: "System Status Unknown",
        color: "default",
        icon: <WarningIcon />,
      };
  }
};

/* ============================================================
   METRIC CARD
============================================================ */

const MetricCard = ({ title, value, subtitle, percentage, icon }) => {
  const statusColor = getStatusColor(percentage);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>

            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
              }}
            >
              {icon}
            </Box>
          </Stack>

          <Box>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>

            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {typeof percentage === "number" && (
            <Stack spacing={1}>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentage, 100)}
                color={statusColor}
                sx={{
                  height: 8,
                  borderRadius: 10,
                }}
              />

              <Typography variant="caption" color="text.secondary">
                {percentage.toFixed(1)}% used
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   INFORMATION ROW
============================================================ */

const InfoRow = ({ label, value, icon }) => {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        py={1.2}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          color="text.secondary"
        >
          {icon}

          <Typography variant="body2">{label}</Typography>
        </Stack>

        <Typography variant="body2" fontWeight={600} textAlign="right">
          {value || "N/A"}
        </Typography>
      </Stack>

      <Divider />
    </>
  );
};

/* ============================================================
   INFORMATION PANEL
============================================================ */

const InfoPanel = ({ title, icon, children }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {icon}

            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          </Stack>

          <Divider />

          <Box>{children}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   LOG FILES SECTION
============================================================ */

const LogFilesSection = ({ title, source, logsData }) => {
  const files = logsData?.files || [];

  return (
    <Card
      elevation={0}
      sx={{
        mb: 4,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <DescriptionIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {logsData?.directory || "Directory unavailable"}
                </Typography>
              </Box>
            </Stack>
            <Chip
              size="small"
              label={source === "pm2" ? "PM2" : "Application"}
              color={source === "pm2" ? "secondary" : "primary"}
              variant="outlined"
            />
          </Stack>

          {!logsData?.available ? (
            <Alert severity="warning">
              {logsData?.message || "This log directory is not available."}
            </Alert>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Log Files"
                    value={logsData.totalFiles || 0}
                    icon={<DescriptionIcon color="primary" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Total Size"
                    value={
                      logsData.totalSizeFormatted ||
                      formatBytes(logsData.totalSize)
                    }
                    icon={<StorageIcon color="primary" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Error Logs"
                    value={logsData.errorLogs?.count || 0}
                    icon={<ErrorIcon color="error" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard
                    title="Output Logs"
                    value={logsData.outputLogs?.count || 0}
                    icon={<ArticleIcon color="primary" />}
                  />
                </Grid>
              </Grid>

              <Divider />

              {files.length > 0 ? (
                <Stack spacing={1.5}>
                  {files.map((file, index) => (
                    <Accordion
                      key={`${source}-${file.name}-${index}`}
                      disableGutters
                      elevation={0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "10px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          justifyContent="space-between"
                          spacing={1}
                          width="100%"
                          mr={1}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <ArticleIcon
                              color={
                                file.type === "error" ? "error" : "primary"
                              }
                            />
                            <Box>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                              >
                                <Typography fontWeight={700}>
                                  {file.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={file.type || "log"}
                                  color={
                                    file.type === "error"
                                      ? "error"
                                      : file.type === "output"
                                        ? "success"
                                        : "default"
                                  }
                                />
                              </Stack>
                              {file.processName && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  Process: {file.processName}
                                </Typography>
                              )}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Modified:{" "}
                                {file.modifiedAt
                                  ? new Date(file.modifiedAt).toLocaleString(
                                      "en-IN",
                                    )
                                  : "N/A"}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Chip
                              size="small"
                              label={
                                file.sizeFormatted || formatBytes(file.size)
                              }
                              variant="outlined"
                            />
                            {file.previewLines > 0 && (
                              <Chip
                                size="small"
                                color="primary"
                                label={`${file.previewLines} lines`}
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Divider sx={{ mb: 2 }} />
                        <Box
                          component="pre"
                          sx={{
                            m: 0,
                            p: 2,
                            maxHeight: 500,
                            overflow: "auto",
                            borderRadius: 2,
                            bgcolor: "action.hover",
                            fontSize: "0.78rem",
                            lineHeight: 1.65,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontFamily:
                              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          }}
                        >
                          {file.preview ||
                            "No readable preview available for this log file."}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              ) : (
                <Alert severity="info">
                  No log files were found in this directory.
                </Alert>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   MAIN PAGE
============================================================ */

const SystemStatus = () => {
  const queryClient = useQueryClient();
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    "system-status",
    () => systemService.getSystemStatus(),
    {
      refetchInterval: 30000,
      refetchOnWindowFocus: false,
      staleTime: 10000,
    },
  );

  // In SystemStatusPage.jsx, update the restart mutation:

  const restartMutation = useMutation(
    (processName) => systemService.restartPm2Process(processName),
    {
      onSuccess: (response) => {
        toast.success(
          response?.message || `${selectedProcess} restarted successfully`,
        );
        setSnackbarMessage(
          response?.message || `${selectedProcess} restarted successfully`,
        );
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setRestartDialogOpen(false);
        setSelectedProcess(null);
        // Refetch system status after restart
        setTimeout(() => refetch(), 3000);
      },
      onError: (error) => {
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to restart process";
        toast.error(errorMsg);
        setSnackbarMessage(errorMsg);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setRestartDialogOpen(false);
        setSelectedProcess(null);
      },
    },
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("System status refreshed");
    } catch (err) {
      toast.error("Failed to refresh system status");
    }
  };

  const handleRestartClick = (processName) => {
    setSelectedProcess(processName);
    setRestartDialogOpen(true);
  };

  const handleRestartConfirm = () => {
    if (selectedProcess) {
      restartMutation.mutate(selectedProcess);
    }
  };

  const handleRestartCancel = () => {
    setRestartDialogOpen(false);
    setSelectedProcess(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error && !data) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          }
        >
          Failed to load system status.
        </Alert>
      </Box>
    );
  }

  /*
   * Supports both:
   *
   * { success: true, data: {...} }
   *
   * and:
   *
   * { success: true, ...systemData }
   */
  const systemData = data?.data || data || {};

  const health = systemData?.health || {};
  const server = systemData?.server || {};
  const cpu = systemData?.cpu || {};
  const memory = systemData?.memory || {};
  const disk = systemData?.disk || {};
  const network = systemData?.network || {};
  const mongo = systemData?.mongodb || systemData?.mongo || {};
  const pm2 = systemData?.pm2 || {};
  const logs = systemData?.logs || {};
  const application = systemData?.application || {};

  const healthConfig = getHealthConfig(health.status);

  const generatedAt = systemData?.timestamp || systemData?.generatedAt;

  // Memory values with proper fallbacks
  const memoryPercentage = memory?.usagePercentage ?? memory?.percentage ?? 0;
  const memoryUsed =
    memory?.actualUsedFormatted ?? memory?.usedFormatted ?? "0 B";
  const memoryTotal = memory?.totalFormatted ?? "0 B";

  return (
    <>
      <Helmet>
        <title>System Monitor | Admin Panel</title>
      </Helmet>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <Box mb={4}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              System Monitor
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Real-time server and application monitoring
            </Typography>

            {generatedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.5}
              >
                Last updated:{" "}
                {new Date(generatedAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </Typography>
            )}
          </Box>

          <Tooltip title="Refresh System Status">
            <span>
              <IconButton
                color="primary"
                onClick={handleRefresh}
                disabled={isFetching}
              >
                {isFetching ? <CircularProgress size={22} /> : <RefreshIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* ======================================================
          HEALTH STATUS
      ====================================================== */}

      <Alert
        severity={healthConfig.color}
        icon={healthConfig.icon}
        sx={{
          mb: 4,
          borderRadius: 3,
        }}
      >
        <Typography fontWeight={700}>{healthConfig.label}</Typography>

        <Typography variant="body2">
          {health.problems?.length > 0
            ? `Issues detected: ${health.problems.join(", ")}`
            : "All monitored services are operating normally."}
        </Typography>
      </Alert>

      {/* ======================================================
          MAIN METRICS
      ====================================================== */}

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="CPU Usage"
            icon={<SpeedIcon color="primary" />}
            value={`${cpu.usage || 0}%`}
            subtitle={`${cpu.cores || 0} CPU cores`}
            percentage={cpu.usage || 0}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Memory"
            icon={<MemoryIcon color="primary" />}
            value={memoryUsed}
            subtitle={`of ${memoryTotal}`}
            percentage={memoryPercentage}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Disk Storage"
            icon={<StorageIcon color="primary" />}
            value={disk.usedFormatted || formatBytes(disk.used)}
            subtitle={`of ${disk.totalFormatted || formatBytes(disk.total)}`}
            percentage={disk.usagePercentage || 0}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <MetricCard
            title="Server Uptime"
            icon={<AccessTimeIcon color="primary" />}
            value={server.uptimeFormatted || formatUptime(server.uptime)}
            subtitle={server.hostname || "Server"}
          />
        </Grid>
      </Grid>

      {/* ======================================================
          SYSTEM INFORMATION
      ====================================================== */}

      <Grid container spacing={3} mb={4}>
        {/* SERVER */}

        <Grid item xs={12} md={6} lg={3}>
          <InfoPanel title="Server" icon={<ServerIcon color="primary" />}>
            <InfoRow label="Hostname" value={server.hostname} />

            <InfoRow
              label="Operating System"
              value={server.distro || server.platform}
            />

            <InfoRow label="Kernel" value={server.kernel} />

            <InfoRow label="Architecture" value={server.architecture} />
          </InfoPanel>
        </Grid>

        {/* DATABASE */}

        <Grid item xs={12} md={6} lg={3}>
          <InfoPanel title="Database" icon={<DatabaseIcon color="primary" />}>
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" fontWeight={600}>
                  MongoDB
                </Typography>

                <Chip
                  size="small"
                  label={
                    mongo.status ||
                    (mongo.connected ? "Connected" : "Disconnected")
                  }
                  color={
                    mongo.connected || mongo.status === "connected"
                      ? "success"
                      : mongo.status === "connecting"
                        ? "warning"
                        : "error"
                  }
                />
              </Stack>

              <Divider />

              <InfoRow
                label="Connection State"
                value={
                  mongo.status ||
                  {
                    0: "Disconnected",
                    1: "Connected",
                    2: "Connecting",
                    3: "Disconnecting",
                  }[mongo.readyState] ||
                  "Unknown"
                }
              />

              <InfoRow label="Database" value={mongo.database || "N/A"} />

              <InfoRow label="Host" value={mongo.host || "N/A"} />
            </Stack>
          </InfoPanel>
        </Grid>

        {/* NETWORK */}

        <Grid item xs={12} md={6} lg={3}>
          <InfoPanel title="Network" icon={<NetworkIcon color="primary" />}>
            <InfoRow label="Interface" value={network.interface} />

            <InfoRow
              label="Downloaded"
              icon={<WifiIcon fontSize="small" />}
              value={
                network.receivedFormatted ||
                formatBytes(network.received ?? network.receivedBytes ?? 0)
              }
            />

            <InfoRow
              label="Uploaded"
              icon={<WifiIcon fontSize="small" />}
              value={
                network.transmittedFormatted ||
                formatBytes(
                  network.transmitted ?? network.transmittedBytes ?? 0,
                )
              }
            />
          </InfoPanel>
        </Grid>

        {/* APPLICATION */}

        <Grid item xs={12} md={6} lg={3}>
          <InfoPanel
            title="Application"
            icon={<TerminalIcon color="primary" />}
          >
            <InfoRow label="Node.js" value={application.nodeVersion} />

            <InfoRow label="Process ID" value={application.pid} />

            <InfoRow
              label="Process Uptime"
              value={
                application.processUptimeFormatted ||
                application.uptimeFormatted ||
                formatUptime(application.processUptime || application.uptime)
              }
            />
          </InfoPanel>
        </Grid>
      </Grid>

      {/* ======================================================
          MEMORY DETAILS
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <MemoryIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Memory Details
              </Typography>
            </Stack>
            <Divider />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <InfoRow
                  label="Actual Used"
                  value={
                    memory.actualUsedFormatted || memory.usedFormatted || "N/A"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoRow
                  label="Available"
                  value={
                    memory.availableFormatted || memory.freeFormatted || "N/A"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoRow
                  label="Linux Cache"
                  value={memory.cachedFormatted || "N/A"}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <InfoRow
                  label="Total RAM"
                  value={memory.totalFormatted || "N/A"}
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          PM2 PROCESSES
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack spacing={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              spacing={1}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <SpeedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  PM2 Processes
                </Typography>
              </Stack>
              <Chip
                size="small"
                label={
                  pm2.available
                    ? `${pm2.online || 0}/${pm2.total || 0} online`
                    : "Unavailable"
                }
                color={
                  pm2.available
                    ? pm2.online === pm2.total
                      ? "success"
                      : "warning"
                    : "error"
                }
              />
            </Stack>

            {pm2.available ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h5" fontWeight={700}>
                        {pm2.totalProcesses || pm2.total || 0}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="success.main"
                      >
                        {pm2.online || 0}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Online
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="warning.main"
                      >
                        {pm2.stopped || 0}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Stopped
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="error.main"
                      >
                        {pm2.errored || 0}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        Errored
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider />

                {pm2.processes?.length > 0 ? (
                  <Stack spacing={1}>
                    {pm2.processes.map((process, index) => (
                      <Card key={`${process.name}-${index}`} variant="outlined">
                        <CardContent
                          sx={{
                            "&:last-child": {
                              pb: 2,
                            },
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={2.5}>
                              <Typography fontWeight={700}>
                                {process.name}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                PID: {process.pid || "N/A"}
                              </Typography>
                            </Grid>

                            <Grid item xs={6} md={1.5}>
                              <Chip
                                size="small"
                                label={process.status || "unknown"}
                                color={
                                  process.status === "online"
                                    ? "success"
                                    : process.status === "stopped"
                                      ? "warning"
                                      : "error"
                                }
                              />
                            </Grid>

                            <Grid item xs={6} md={1.5}>
                              <Typography variant="caption">CPU</Typography>

                              <Typography fontWeight={600}>
                                {process.cpu || 0}%
                              </Typography>
                            </Grid>

                            <Grid item xs={6} md={1.5}>
                              <Typography variant="caption">Memory</Typography>

                              <Typography fontWeight={600}>
                                {formatBytes(process.memory || 0)}
                              </Typography>
                            </Grid>

                            <Grid item xs={6} md={2}>
                              <Typography variant="caption">
                                Restarts
                              </Typography>

                              <Typography fontWeight={600}>
                                {process.restarts || 0}
                              </Typography>
                            </Grid>

                            <Grid item xs={12} md={3}>
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent={{
                                  xs: "flex-start",
                                  md: "flex-end",
                                }}
                              >
                                <Tooltip title={`Restart ${process.name}`}>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<RestartIcon />}
                                    onClick={() =>
                                      handleRestartClick(process.name)
                                    }
                                    disabled={restartMutation.isLoading}
                                  >
                                    Restart
                                  </Button>
                                </Tooltip>
                              </Stack>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    No PM2 process information available.
                  </Typography>
                )}
              </>
            ) : (
              <Alert severity="warning">PM2 information is unavailable.</Alert>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          APPLICATION LOGS
      ====================================================== */}

      <LogFilesSection
        title="Application Logs"
        source="application"
        logsData={logs.application}
      />

      {/* ======================================================
          PM2 LOGS
      ====================================================== */}

      <LogFilesSection title="PM2 Logs" source="pm2" logsData={logs.pm2} />

      {/* ======================================================
          REFRESH ERROR
      ====================================================== */}

      {error && data && (
        <Alert severity="warning">
          Unable to fetch the latest system information. Showing previously
          loaded data.
        </Alert>
      )}

      {/* ======================================================
          RESTART CONFIRMATION DIALOG
      ====================================================== */}

      <Dialog
        open={restartDialogOpen}
        onClose={handleRestartCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Restart PM2 Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to restart the PM2 process "{selectedProcess}
            "? This will temporarily stop and restart the process. The
            application may experience a brief interruption.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleRestartCancel}
            disabled={restartMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRestartConfirm}
            color="primary"
            variant="contained"
            disabled={restartMutation.isLoading}
            startIcon={
              restartMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : (
                <RestartIcon />
              )
            }
          >
            {restartMutation.isLoading ? "Restarting..." : "Restart"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          SNACKBAR
      ====================================================== */}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SystemStatus;
