import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  CampaignOutlined as CampaignOutlinedIcon,
  SendRounded as SendRoundedIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  LinkOutlined as LinkOutlinedIcon,
} from "@mui/icons-material";

import { analyticsService } from "../services/analyticsService";

const INITIAL_FORM = {
  title: "",
  body: "",
  link: "",
  audience: "vendor",
};

const isHttpsUrl = (value) => {
  if (!value?.trim()) return false;

  try {
    const url = new URL(value.trim());

    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
};

const AUDIENCE_OPTIONS = {
  all: "All customers and vendors",
  user: "Customers only",
  vendor: "Vendors only",
};

export default function AdminNotificationManagement() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const setField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));

    setResult(null);
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      return "Notification title required hai.";
    }

    if (form.title.trim().length > 100) {
      return "Title maximum 100 characters ka ho sakta hai.";
    }

    if (!form.body.trim()) {
      return "Notification message required hai.";
    }

    if (form.body.trim().length > 500) {
      return "Message maximum 500 characters ka ho sakta hai.";
    }

    if (!isHttpsUrl(form.link)) {
      return "Valid HTTPS link enter karein.";
    }

    if (!Object.hasOwn(AUDIENCE_OPTIONS, form.audience)) {
      return "Valid audience select karein.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setResult(null);

    const validationError = validateForm();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const audienceLabel = AUDIENCE_OPTIONS[form.audience];

    const confirmed = window.confirm(
      `Notification "${audienceLabel}" ko bheja jayega.\n\n` +
        "Selected audience ke sabhi eligible recipients ko notification " +
        "queue kiya ja sakta hai. Kya aap continue karna chahte hain?",
    );

    if (!confirmed) return;

    try {
      setSending(true);

      const response = await analyticsService.sendAdminNotification({
        title: form.title.trim(),
        body: form.body.trim(),
        link: form.link.trim(),
        audience: form.audience,
      });

      const queued = Number(response?.queued ?? 0);
      const failed = Number(response?.failed ?? 0);

      const summary = {
        campaignId: response?.campaignId || "",
        audience: response?.audience || form.audience,
        recipients: response?.recipients ?? response?.totalRecipients ?? 0,
        queued,
        failed,
        message: response?.message || "Notification request processed.",
      };

      setResult({
        severity: response?.success
          ? "success"
          : queued > 0
            ? "warning"
            : "error",
        ...summary,
      });

      if (queued > 0) {
        toast.success(`${queued} notification job(s) queued.`);
      } else {
        toast.error(response?.message || "Koi notification queue nahi hua.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Notification send nahi ho saka. API aur authentication check karein.";

      setResult({
        severity: "error",
        message,
      });

      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setResult(null);
  };

  return (
    <>
      <Helmet>
        <title>Send Notification | Aapkakaam Admin</title>
      </Helmet>

      <Box sx={{ maxWidth: 1200, mx: "auto", pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
              <CampaignOutlinedIcon color="primary" fontSize="large" />

              <Typography variant="h4" fontWeight={800}>
                Send Notification
              </Typography>
            </Stack>

            <Typography color="text.secondary">
              Customers aur service providers ko push notification bhejein.
            </Typography>
          </Box>

          <Chip
            icon={<GroupsOutlinedIcon />}
            label="Firebase Push"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Notification existing backend queue ke through process hogi. Queue
          mein add hona successful delivery ki guarantee nahi hai.
        </Alert>

        {result && (
          <Alert
            severity={result.severity}
            sx={{ mb: 3, overflowWrap: "anywhere" }}
          >
            <Typography fontWeight={700}>{result.message}</Typography>

            {result.campaignId && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Campaign ID: {result.campaignId}
              </Typography>
            )}

            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Recipients: {result.recipients} · Queued: {result.queued} ·
              Failed: {result.failed}
            </Typography>
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.15fr) minmax(300px, 0.85fr)",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" spacing={1.25} alignItems="center" mb={2}>
                <SendRoundedIcon color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight={750}>
                    Notification details
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Message aur recipient audience configure karein.
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth>
                    <InputLabel id="notification-audience-label">
                      Select audience
                    </InputLabel>

                    <Select
                      labelId="notification-audience-label"
                      label="Select audience"
                      value={form.audience}
                      onChange={setField("audience")}
                      disabled={sending}
                    >
                      <MenuItem value="all">All — Customers + Vendors</MenuItem>

                      <MenuItem value="user">User — Customers only</MenuItem>

                      <MenuItem value="vendor">
                        Vendor — Service providers only
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {form.audience === "all" && (
                    <Alert severity="warning">
                      All eligible customers aur vendors ko notification queue
                      ki ja sakti hai.
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    required
                    label="Notification title"
                    placeholder="Aapkakaam Update"
                    value={form.title}
                    onChange={setField("title")}
                    inputProps={{ maxLength: 100 }}
                    helperText={`${form.title.length}/100 characters`}
                    disabled={sending}
                  />

                  <TextField
                    fullWidth
                    required
                    multiline
                    minRows={3}
                    label="Notification message"
                    placeholder="Yahan notification ka message likhein..."
                    value={form.body}
                    onChange={setField("body")}
                    inputProps={{ maxLength: 500 }}
                    helperText={`${form.body.length}/500 characters`}
                    disabled={sending}
                  />

                  <TextField
                    fullWidth
                    required
                    label="Destination HTTPS link"
                    placeholder="https://example.com/service"
                    value={form.link}
                    onChange={setField("link")}
                    error={Boolean(form.link) && !isHttpsUrl(form.link)}
                    helperText="Notification tap karne par ye link browser mein open hoga."
                    disabled={sending}
                    InputProps={{
                      startAdornment: (
                        <LinkOutlinedIcon
                          fontSize="small"
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />

                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      onClick={resetForm}
                      disabled={sending}
                    >
                      Reset
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SendRoundedIcon />}
                      disabled={sending}
                    >
                      {sending ? "Queueing..." : "Send Notification"}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" fontWeight={750} mb={1}>
                Notification preview
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Approximate notification appearance.
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <CampaignOutlinedIcon />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={750}>
                      {form.title.trim() || "Notification title"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, overflowWrap: "anywhere" }}
                    >
                      {form.body.trim() || "Your message will appear here."}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="primary.main"
                      sx={{ display: "block", mt: 1, overflowWrap: "anywhere" }}
                    >
                      {form.link.trim() || "Destination link"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" mb={1}>
                Selected recipients
              </Typography>

              <Chip
                color={form.audience === "all" ? "warning" : "primary"}
                label={AUDIENCE_OPTIONS[form.audience]}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Only accounts with a stored FCM token are eligible. Actual
                delivery depends on Firebase, the worker and the device.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
