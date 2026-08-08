import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const { admin } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [profile, setProfile] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.phoneNo || "",
  });

  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: true,
  });

  const handleTabChange = (event, newValue) => setActiveTab(newValue);
  const handleProfileChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) =>
    setPassword({ ...password, [e.target.name]: e.target.value });
  const handlePreferenceChange = (e) =>
    setPreferences({ ...preferences, [e.target.name]: e.target.checked });

  const handleSaveProfile = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Profile updated successfully");
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (password.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Password changed successfully");
    setPassword({ current: "", new: "", confirm: "" });
    setLoading(false);
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Preferences updated successfully");
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Settings | Admin Panel</title>
      </Helmet>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Settings
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Profile" icon={<SecurityIcon />} iconPosition="start" />
          <Tab label="Security" icon={<SecurityIcon />} iconPosition="start" />
          <Tab
            label="Preferences"
            icon={<PaletteIcon />}
            iconPosition="start"
          />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Update your profile information
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Profile"}
                </Button>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  Change your password regularly
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  name="current"
                  value={password.current}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  name="new"
                  value={password.new}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  name="confirm"
                  value={password.confirm}
                  onChange={handlePasswordChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Manage your preferences
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.emailNotifications}
                          onChange={handlePreferenceChange}
                          name="emailNotifications"
                        />
                      }
                      label="Email Notifications"
                    />
                    <Typography variant="body2" color="textSecondary">
                      Receive email updates about important events
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.pushNotifications}
                          onChange={handlePreferenceChange}
                          name="pushNotifications"
                        />
                      }
                      label="Push Notifications"
                    />
                    <Typography variant="body2" color="textSecondary">
                      Receive push notifications in your browser
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences.darkMode}
                          onChange={handlePreferenceChange}
                          name="darkMode"
                        />
                      }
                      label="Dark Mode"
                    />
                    <Typography variant="body2" color="textSecondary">
                      Enable dark mode for the dashboard
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSavePreferences}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Preferences"}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
};

export default SettingsPage;
