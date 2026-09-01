import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  Stack,
  LinearProgress,
  Alert,
} from "@mui/material";

import {
  Android as AndroidIcon,
  Apple as AppleIcon,
  Save as SaveIcon,
  Update as UpdateIcon,
  Download as DownloadIcon,
  TouchApp as TouchAppIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";

import { useQuery } from "react-query";
import { toast } from "react-toastify";

import { analyticsService } from "../services/analyticsService";
import LoadingSpinner from "../components/common/LoadingSpinner";

/* ============================================================

* DEFAULT APP VERSION CONFIG
* ========================================================== */

const defaultConfig = {
  platform: "",
  latestVersion: "",
  minimumVersion: "",
  updateTitle: "Update Available",
  updateMessage: "A new version of AapkaKaam is available.",
  updateUrl: "",
  forceUpdate: false,
  maintenanceMode: false,
  enabled: true,
};

/* ============================================================

* DEFAULT WEBSITE MAINTENANCE CONFIG
* ========================================================== */

const defaultMaintenanceConfig = {
  // Master Control
  mode: "auto",

  // Schedule Type
  // specific = One-time maintenance
  // recurring = Weekly recurring maintenance
  scheduleType: "specific",

  // Recurring Schedule
  scheduleEnabled: false,

  startDay: 6,
  startTime: "12:00",

  endDay: 0,
  endTime: "02:00",

  // Specific Date & Time
  startDateTime: "",
  endDateTime: "",

  // Advance Notification
  notificationEnabled: true,
  notificationMinutesBefore: 60,

  // English Content
  title: "We'll Be Back Soon",

  subtitle: "We are improving something better for you.",

  message:
    "AapkaKaam is temporarily unavailable while we perform scheduled maintenance. Please try again later.",

  // Hindi Content
  hindiTitle: "हम जल्द वापस आएंगे",

  hindiSubtitle: "हम आपके लिए कुछ बेहतर बना रहे हैं",

  hindiMessage:
    "AapkaKaam पर रखरखाव का काम चल रहा है। कृपया कुछ समय बाद दोबारा प्रयास करें।",
};

/* ============================================================

* HELPERS
* ========================================================== */

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const toDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;

    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

const formatDateTime = (value) => {
  if (!value) {
    return "Not scheduled";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Not scheduled";
    }

    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "Not scheduled";
  }
};

/* ============================================================

* ANALYTICS CARD
* ========================================================== */

const AnalyticsCard = ({ title, value, subtitle, icon }) => {
  return (
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
          mb={2}
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
        </Box>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            lineHeight: 1.1,
          }}
        >
          {formatNumber(value)}
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
};

/* ============================================================

* MAIN COMPONENT
* ========================================================== */

const AppVersionManagement = () => {
  const [tab, setTab] = useState(0);

  /* ==========================================================

* WEBSITE MAINTENANCE QUERY
* ======================================================== */

  const {
    data: maintenanceData,
    isLoading: isLoadingMaintenance,
    isFetching: isFetchingMaintenance,
    refetch: refetchMaintenance,
  } = useQuery(
    ["websiteMaintenance"],
    () => analyticsService.getWebsiteMaintenance(),
    {
      refetchOnWindowFocus: false,
    },
  );

  /* ==========================================================

* MAINTENANCE FORM
* ======================================================== */

  const [maintenanceForm, setMaintenanceForm] = useState(
    defaultMaintenanceConfig,
  );

  const [savingMaintenance, setSavingMaintenance] = useState(false);

  /* ==========================================================

* SYNC MAINTENANCE API DATA
* ======================================================== */

  useEffect(() => {
    const settings =
      maintenanceData?.settings ||
      maintenanceData?.maintenance ||
      maintenanceData?.data?.settings ||
      maintenanceData?.data;

    if (settings) {
      setMaintenanceForm({
        ...defaultMaintenanceConfig,
        ...settings,

        startDateTime: toDateTimeLocalValue(settings.startDateTime) || "",

        endDateTime: toDateTimeLocalValue(settings.endDateTime) || "",
      });
    }
  }, [maintenanceData]);

  /* ==========================================================

* APP VERSION SETTINGS QUERY
* ======================================================== */

  const {
    data,
    isLoading,
    refetch,
    isFetching: isFetchingVersions,
  } = useQuery(["appVersions"], () => analyticsService.getAppVersions(), {
    refetchOnWindowFocus: false,
  });

  /* ==========================================================

* VERSION ANALYTICS QUERY
* ======================================================== */

  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    isFetching: isFetchingAnalytics,
    refetch: refetchAnalytics,
  } = useQuery(
    ["appVersionAnalytics"],
    () => analyticsService.getAppVersionAnalytics(),
    {
      refetchOnWindowFocus: false,
    },
  );

  /* ==========================================================

* VERSION DATA
* ======================================================== */

  const versions = data?.versions || [];

  const android = versions.find((v) => v.platform === "android") || {
    ...defaultConfig,
    platform: "android",
  };

  const ios = versions.find((v) => v.platform === "ios") || {
    ...defaultConfig,
    platform: "ios",
  };

  /* ==========================================================

* APP VERSION FORM STATES
* ======================================================== */

  const [androidForm, setAndroidForm] = useState(android);

  const [iosForm, setIosForm] = useState(ios);

  /* ==========================================================

* SYNC APP VERSION DATA
* ======================================================== */

  useEffect(() => {
    setAndroidForm({
      ...defaultConfig,
      ...android,
    });

    setIosForm({
      ...defaultConfig,
      ...ios,
    });
  }, [data]);

  /* ==========================================================

* CURRENT PLATFORM
* ======================================================== */

  const currentForm = tab === 0 ? androidForm : iosForm;

  const setCurrentForm = tab === 0 ? setAndroidForm : setIosForm;

  const platform = tab === 0 ? "android" : "ios";

  /* ==========================================================

* ANALYTICS DATA
* ======================================================== */

  const summary = analyticsData?.summary || {};

  const versionDistribution = analyticsData?.versions || [];

  const platformVersions = versionDistribution.filter(
    (item) => item.platform === platform,
  );

  /* ==========================================================

* SAVE WEBSITE MAINTENANCE
* ======================================================== */

  const handleSaveMaintenance = async () => {
    try {
      setSavingMaintenance(true);

      /* ======================================================
       * VALIDATE SPECIFIC SCHEDULE
       * ==================================================== */

      if (
        maintenanceForm.mode === "auto" &&
        maintenanceForm.scheduleType === "specific"
      ) {
        if (!maintenanceForm.startDateTime) {
          toast.error("Please select the maintenance start date and time");

          return;
        }

        if (!maintenanceForm.endDateTime) {
          toast.error("Please select the maintenance end date and time");

          return;
        }

        const start = new Date(maintenanceForm.startDateTime);

        const end = new Date(maintenanceForm.endDateTime);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          toast.error("Please enter valid maintenance dates");

          return;
        }

        if (end <= start) {
          toast.error("Maintenance end time must be after the start time");

          return;
        }
      }

      /* ======================================================
       * VALIDATE NOTIFICATION
       * ==================================================== */

      const notificationMinutes = Number(
        maintenanceForm.notificationMinutesBefore,
      );

      if (
        maintenanceForm.notificationEnabled &&
        (Number.isNaN(notificationMinutes) || notificationMinutes < 0)
      ) {
        toast.error("Notification time must be zero or greater");

        return;
      }

      /* ======================================================
       * CREATE PAYLOAD
       * ==================================================== */

      const payload = {
        // Master Control
        mode: maintenanceForm.mode,

        // Schedule Type
        scheduleType: maintenanceForm.scheduleType,

        // Weekly Schedule
        scheduleEnabled: maintenanceForm.scheduleEnabled,

        startDay: Number(maintenanceForm.startDay),

        startTime: maintenanceForm.startTime,

        endDay: Number(maintenanceForm.endDay),

        endTime: maintenanceForm.endTime,

        // Specific Schedule
        startDateTime: maintenanceForm.startDateTime
          ? new Date(maintenanceForm.startDateTime).toISOString()
          : null,

        endDateTime: maintenanceForm.endDateTime
          ? new Date(maintenanceForm.endDateTime).toISOString()
          : null,

        // Advance Notification
        notificationEnabled: Boolean(maintenanceForm.notificationEnabled),

        notificationMinutesBefore: notificationMinutes,

        // English Content
        title: (maintenanceForm.title || "").trim(),

        subtitle: (maintenanceForm.subtitle || "").trim(),

        message: (maintenanceForm.message || "").trim(),

        // Hindi Content
        hindiTitle: (maintenanceForm.hindiTitle || "").trim(),

        hindiSubtitle: (maintenanceForm.hindiSubtitle || "").trim(),

        hindiMessage: (maintenanceForm.hindiMessage || "").trim(),
      };

      /* ======================================================
       * SAVE
       * ==================================================== */

      const response = await analyticsService.updateWebsiteMaintenance(payload);

      toast.success(
        response?.message ||
          "Website maintenance settings updated successfully",
      );

      await refetchMaintenance();
    } catch (err) {
      console.error("Maintenance update error:", err);

      toast.error(
        err?.response?.data?.message || "Failed to update maintenance settings",
      );
    } finally {
      setSavingMaintenance(false);
    }
  };

  /* ==========================================================

* SAVE APP VERSION
* ======================================================== */

  const handleSave = async () => {
    try {
      await analyticsService.updateAppVersion(platform, currentForm);

      toast.success(`${platform.toUpperCase()} settings updated successfully`);

      await refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save settings");
    }
  };

  /* ==========================================================

* REFRESH EVERYTHING
* ======================================================== */

  const handleRefresh = async () => {
    try {
      await Promise.all([refetch(), refetchAnalytics(), refetchMaintenance()]);

      toast.success("All data refreshed successfully");
    } catch {
      toast.error("Failed to refresh data");
    }
  };

  /* ==========================================================

* LOADING
* ======================================================== */

  if (isLoading) {
    return <LoadingSpinner />;
  }

  /* ==========================================================

* RENDER
* ======================================================== */

  return (
    <>
      {" "}
      <Helmet>
        {" "}
        <title>App Version Management | Admin </title>{" "}
      </Helmet>
      {/* ======================================================
       * HEADER
       * ==================================================== */}
      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          gap={2}
          flexDirection={{
            xs: "column",
            sm: "row",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              App Version Management
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Manage app updates, APK downloads, maintenance mode and version
              analytics.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={
              isFetchingVersions || isFetchingAnalytics || isFetchingMaintenance
            }
          >
            Refresh
          </Button>
        </Box>
      </Box>
      {/* ======================================================
       * ANALYTICS
       * ==================================================== */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AnalyticsIcon color="primary" />

          <Typography variant="h6" fontWeight={700}>
            Download Analytics
          </Typography>
        </Box>

        {isLoadingAnalytics ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <LinearProgress />
          </Paper>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <AnalyticsCard
                title="Version Checks"
                value={summary.versionChecks}
                subtitle="App version checks recorded"
                icon={<CheckCircleIcon color="primary" />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <AnalyticsCard
                title="Update Clicks"
                value={summary.updateClicks}
                subtitle="Users who pressed Update"
                icon={<TouchAppIcon color="primary" />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <AnalyticsCard
                title="APK Downloads"
                value={summary.apkDownloads}
                subtitle="Tracked APK downloads"
                icon={<DownloadIcon color="primary" />}
              />
            </Grid>
          </Grid>
        )}
      </Box>
      {/* ======================================================
       * VERSION DISTRIBUTION
       * ==================================================== */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Installed Version Distribution
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Versions reported by users during version checks.
              </Typography>
            </Box>

            <Chip
              icon={platform === "android" ? <AndroidIcon /> : <AppleIcon />}
              label={platform.toUpperCase()}
              variant="outlined"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {platformVersions.length === 0 ? (
            <Alert severity="info">
              No version analytics available yet for {platform.toUpperCase()}.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {platformVersions.map((item) => (
                <Box key={`${item.platform}-${item.version}`}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={0.5}
                  >
                    <Typography fontWeight={700}>v{item.version}</Typography>

                    <Typography variant="body2" color="text.secondary">
                      {formatNumber(item.checks)} checks · {item.percentage}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Number(item.percentage || 0))}
                    sx={{
                      height: 8,
                      borderRadius: 10,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
      {/* ======================================================
       * PLATFORM TABS
       * ==================================================== */}
      <Paper
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(event, value) => setTab(value)}
          variant="fullWidth"
        >
          <Tab icon={<AndroidIcon />} iconPosition="start" label="Android" />

          <Tab icon={<AppleIcon />} iconPosition="start" label="iOS" />
        </Tabs>
      </Paper>
      {/* ======================================================
       * APP VERSION SETTINGS
       * ==================================================== */}
      <Grid container spacing={3}>
        {/* STATUS CARD */}

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                {platform === "android" ? "Android" : "iOS"} Status
              </Typography>

              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip
                  color={currentForm.enabled ? "success" : "default"}
                  label={currentForm.enabled ? "Enabled" : "Disabled"}
                />

                {currentForm.forceUpdate && (
                  <Chip color="error" label="Force Update" />
                )}

                {currentForm.maintenanceMode && (
                  <Chip color="warning" label="Maintenance" />
                )}
              </Box>

              <Divider
                sx={{
                  my: 2,
                }}
              />

              <Typography variant="body2" color="text.secondary">
                Latest Version
              </Typography>

              <Typography variant="h4" fontWeight={800}>
                {currentForm.latestVersion || "-"}
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={2}>
                Minimum Supported
              </Typography>

              <Typography variant="h6" fontWeight={700}>
                {currentForm.minimumVersion || "-"}
              </Typography>

              <Divider
                sx={{
                  my: 2,
                }}
              />

              <Typography variant="body2" color="text.secondary">
                APK Downloads
              </Typography>

              <Typography variant="h6" fontWeight={800}>
                {formatNumber(summary.apkDownloads)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* VERSION SETTINGS */}

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={700}>
                Version Settings
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={3}>
                Configure which version users should receive and how updates are
                handled.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Latest Version"
                    placeholder="1.0.2"
                    value={currentForm.latestVersion}
                    onChange={(e) =>
                      setCurrentForm({
                        ...currentForm,
                        latestVersion: e.target.value,
                      })
                    }
                    helperText="Format: x.y.z"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Version"
                    placeholder="1.0.0"
                    value={currentForm.minimumVersion}
                    onChange={(e) =>
                      setCurrentForm({
                        ...currentForm,
                        minimumVersion: e.target.value,
                      })
                    }
                    helperText="Old versions below this are blocked"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={
                      platform === "android"
                        ? "APK Download URL"
                        : "App Store URL"
                    }
                    value={currentForm.updateUrl}
                    onChange={(e) =>
                      setCurrentForm({
                        ...currentForm,
                        updateUrl: e.target.value,
                      })
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Update Title"
                    value={currentForm.updateTitle}
                    onChange={(e) =>
                      setCurrentForm({
                        ...currentForm,
                        updateTitle: e.target.value,
                      })
                    }
                    inputProps={{
                      maxLength: 120,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Update Message"
                    value={currentForm.updateMessage}
                    onChange={(e) =>
                      setCurrentForm({
                        ...currentForm,
                        updateMessage: e.target.value,
                      })
                    }
                    inputProps={{
                      maxLength: 500,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                    }}
                  >
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentForm.enabled}
                            onChange={(e) =>
                              setCurrentForm({
                                ...currentForm,
                                enabled: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Enable Version Check"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentForm.forceUpdate}
                            onChange={(e) =>
                              setCurrentForm({
                                ...currentForm,
                                forceUpdate: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Force Update"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={currentForm.maintenanceMode}
                            onChange={(e) =>
                              setCurrentForm({
                                ...currentForm,
                                maintenanceMode: e.target.checked,
                              })
                            }
                          />
                        }
                        label="App Maintenance Mode"
                      />
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                    >
                      Save Settings
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<UpdateIcon />}
                      onClick={handleRefresh}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* ======================================================
       * WEBSITE MAINTENANCE MANAGEMENT
       * ==================================================== */}
      <Box mt={5}>
        {/* HEADER */}

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Website Maintenance
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Schedule maintenance, notify users in advance and control the
              maintenance page.
            </Typography>
          </Box>

          <Chip
            color={maintenanceData?.active ? "warning" : "success"}
            label={
              maintenanceData?.active ? "MAINTENANCE ACTIVE" : "WEBSITE ONLINE"
            }
            icon={
              maintenanceData?.active ? <UpdateIcon /> : <CheckCircleIcon />
            }
          />
        </Box>

        {isLoadingMaintenance ? (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
            }}
          >
            <LinearProgress />
          </Paper>
        ) : (
          <Card
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              {/* ==================================================
               * MAINTENANCE CONTROL
               * ================================================== */}

              <Typography variant="subtitle1" fontWeight={800} mb={1}>
                Maintenance Control
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Choose automatic scheduling, immediate maintenance, or keep the
                website online.
              </Typography>

              <Grid container spacing={2} mb={3}>
                {/* AUTO */}

                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    onClick={() =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        mode: "auto",
                      })
                    }
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderWidth: maintenanceForm.mode === "auto" ? 2 : 1,
                      borderColor:
                        maintenanceForm.mode === "auto"
                          ? "primary.main"
                          : "divider",
                      bgcolor:
                        maintenanceForm.mode === "auto"
                          ? "action.selected"
                          : "background.paper",
                    }}
                  >
                    <Typography fontWeight={800}>AUTO</Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Follow the configured maintenance schedule.
                    </Typography>
                  </Paper>
                </Grid>

                {/* ON */}

                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    onClick={() =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        mode: "on",
                      })
                    }
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderWidth: maintenanceForm.mode === "on" ? 2 : 1,
                      borderColor:
                        maintenanceForm.mode === "on"
                          ? "warning.main"
                          : "divider",
                      bgcolor:
                        maintenanceForm.mode === "on"
                          ? "action.selected"
                          : "background.paper",
                    }}
                  >
                    <Typography fontWeight={800} color="warning.main">
                      ON
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Immediately show the maintenance page.
                    </Typography>
                  </Paper>
                </Grid>

                {/* OFF */}

                <Grid item xs={12} md={4}>
                  <Paper
                    variant="outlined"
                    onClick={() =>
                      setMaintenanceForm({
                        ...maintenanceForm,
                        mode: "off",
                      })
                    }
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: "pointer",
                      borderWidth: maintenanceForm.mode === "off" ? 2 : 1,
                      borderColor:
                        maintenanceForm.mode === "off"
                          ? "success.main"
                          : "divider",
                      bgcolor:
                        maintenanceForm.mode === "off"
                          ? "action.selected"
                          : "background.paper",
                    }}
                  >
                    <Typography fontWeight={800} color="success.main">
                      OFF
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Keep the website online.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* MODE ALERTS */}

              {maintenanceForm.mode === "on" && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  Manual maintenance is ON. Users will immediately see the full
                  maintenance page after saving these settings.
                </Alert>
              )}

              {maintenanceForm.mode === "off" && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  Maintenance is OFF. The website will remain online regardless
                  of any configured schedule.
                </Alert>
              )}

              {/* ==================================================
               * SCHEDULE TYPE
               * ================================================== */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 3,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ScheduleIcon color="primary" />

                  <Typography variant="subtitle1" fontWeight={800}>
                    Maintenance Schedule Type
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Select whether maintenance should happen once at a specific
                  date or repeat weekly.
                </Typography>

                <Grid container spacing={2}>
                  {/* SPECIFIC */}

                  <Grid item xs={12} md={6}>
                    <Paper
                      variant="outlined"
                      onClick={() =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          scheduleType: "specific",
                        })
                      }
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: "pointer",
                        borderWidth:
                          maintenanceForm.scheduleType === "specific" ? 2 : 1,
                        borderColor:
                          maintenanceForm.scheduleType === "specific"
                            ? "primary.main"
                            : "divider",
                        bgcolor:
                          maintenanceForm.scheduleType === "specific"
                            ? "action.selected"
                            : "background.paper",
                      }}
                    >
                      <Typography fontWeight={800}>
                        Specific Date & Time
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                      >
                        Run maintenance once during a selected date and time
                        period.
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* RECURRING */}

                  <Grid item xs={12} md={6}>
                    <Paper
                      variant="outlined"
                      onClick={() =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          scheduleType: "recurring",
                        })
                      }
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: "pointer",
                        borderWidth:
                          maintenanceForm.scheduleType === "recurring" ? 2 : 1,
                        borderColor:
                          maintenanceForm.scheduleType === "recurring"
                            ? "primary.main"
                            : "divider",
                        bgcolor:
                          maintenanceForm.scheduleType === "recurring"
                            ? "action.selected"
                            : "background.paper",
                      }}
                    >
                      <Typography fontWeight={800}>Weekly Recurring</Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                      >
                        Automatically repeat maintenance every week.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* ==================================================
               * SPECIFIC DATE SCHEDULE
               * ================================================== */}

              {maintenanceForm.scheduleType === "specific" && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    mb: 3,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={800} mb={1}>
                    Specific Maintenance Schedule
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Select exactly when the maintenance should start and finish.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Maintenance Start"
                        value={maintenanceForm.startDateTime || ""}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            startDateTime: e.target.value,
                          })
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="datetime-local"
                        label="Maintenance End"
                        value={maintenanceForm.endDateTime || ""}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            endDateTime: e.target.value,
                          })
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>

                  {maintenanceForm.startDateTime &&
                    maintenanceForm.endDateTime && (
                      <Alert
                        severity="info"
                        sx={{
                          mt: 2,
                          borderRadius: 2,
                        }}
                      >
                        Scheduled from{" "}
                        {formatDateTime(maintenanceForm.startDateTime)} until{" "}
                        {formatDateTime(maintenanceForm.endDateTime)}.
                      </Alert>
                    )}
                </Paper>
              )}

              {/* ==================================================
               * RECURRING SCHEDULE
               * ================================================== */}

              {maintenanceForm.scheduleType === "recurring" && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    mb: 3,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={2}
                    flexWrap="wrap"
                  >
                    <Box>
                      <Typography fontWeight={800}>
                        Weekly Automatic Schedule
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Configure the weekly maintenance window.
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={maintenanceForm.scheduleEnabled}
                          onChange={(e) =>
                            setMaintenanceForm({
                              ...maintenanceForm,
                              scheduleEnabled: e.target.checked,
                            })
                          }
                        />
                      }
                      label={
                        maintenanceForm.scheduleEnabled ? "Enabled" : "Disabled"
                      }
                    />
                  </Box>

                  <Divider
                    sx={{
                      my: 2,
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        select
                        fullWidth
                        label="Start Day"
                        value={maintenanceForm.startDay}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            startDay: Number(e.target.value),
                          })
                        }
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value={0}>Sunday</option>

                        <option value={1}>Monday</option>

                        <option value={2}>Tuesday</option>

                        <option value={3}>Wednesday</option>

                        <option value={4}>Thursday</option>

                        <option value={5}>Friday</option>

                        <option value={6}>Saturday</option>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        type="time"
                        label="Start Time"
                        value={maintenanceForm.startTime}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            startTime: e.target.value,
                          })
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        select
                        fullWidth
                        label="End Day"
                        value={maintenanceForm.endDay}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            endDay: Number(e.target.value),
                          })
                        }
                        SelectProps={{
                          native: true,
                        }}
                      >
                        <option value={0}>Sunday</option>

                        <option value={1}>Monday</option>

                        <option value={2}>Tuesday</option>

                        <option value={3}>Wednesday</option>

                        <option value={4}>Thursday</option>

                        <option value={5}>Friday</option>

                        <option value={6}>Saturday</option>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        type="time"
                        label="End Time"
                        value={maintenanceForm.endTime}
                        onChange={(e) =>
                          setMaintenanceForm({
                            ...maintenanceForm,
                            endTime: e.target.value,
                          })
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* ==================================================
               * ADVANCE NOTIFICATION
               * ================================================== */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 3,
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <NotificationsActiveIcon color="primary" />

                  <Typography variant="subtitle1" fontWeight={800}>
                    Advance Maintenance Notification
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  Show users a notification banner before maintenance begins.
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={maintenanceForm.notificationEnabled}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          notificationEnabled: e.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    maintenanceForm.notificationEnabled
                      ? "Notification Enabled"
                      : "Notification Disabled"
                  }
                />

                {maintenanceForm.notificationEnabled && (
                  <Box mt={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Notify Users Before Maintenance"
                      value={maintenanceForm.notificationMinutesBefore}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          notificationMinutesBefore: Math.max(
                            0,
                            Number(e.target.value),
                          ),
                        })
                      }
                      inputProps={{
                        min: 0,
                        max: 10080,
                      }}
                      helperText="Time in minutes. Example: 60 means users see the banner one hour before maintenance starts."
                    />
                  </Box>
                )}
              </Paper>

              {/* ==================================================
               * ENGLISH CONTENT
               * ================================================== */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} mb={2}>
                  English Maintenance Content
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={maintenanceForm.title || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          title: e.target.value,
                        })
                      }
                      inputProps={{
                        maxLength: 120,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subtitle"
                      value={maintenanceForm.subtitle || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          subtitle: e.target.value,
                        })
                      }
                      inputProps={{
                        maxLength: 200,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Message"
                      value={maintenanceForm.message || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          message: e.target.value,
                        })
                      }
                      inputProps={{
                        maxLength: 500,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* ==================================================
               * HINDI CONTENT
               * ================================================== */}

              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  mb: 3,
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} mb={2}>
                  Hindi Maintenance Content
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="शीर्षक"
                      value={maintenanceForm.hindiTitle || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          hindiTitle: e.target.value,
                        })
                      }
                      inputProps={{
                        maxLength: 120,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="सबटाइटल"
                      value={maintenanceForm.hindiSubtitle || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          hindiSubtitle: e.target.value,
                        })
                      }
                      inputProps={{
                        maxLength: 200,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="संदेश"
                      value={maintenanceForm.hindiMessage || ""}
                      onChange={(e) =>
                        setMaintenanceForm({
                          ...maintenanceForm,
                          hindiMessage: e.target.value,
                        })
                      }
                      inputProps={{
                        maxLength: 500,
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* ==================================================
               * MAINTENANCE ACTIONS
               * ================================================== */}

              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveMaintenance}
                  disabled={savingMaintenance}
                >
                  {savingMaintenance
                    ? "Saving..."
                    : "Save Maintenance Settings"}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={async () => {
                    await refetchMaintenance();
                  }}
                  disabled={isFetchingMaintenance || savingMaintenance}
                >
                  Refresh
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </>
  );
};

export default AppVersionManagement;
