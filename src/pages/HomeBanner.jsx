// src/pages/admin/HomeBannerManagement.jsx
// Admin page for managing the Aapkakaam Flutter home banner.
// Expected backend:
//   GET /api/admin/home-banner  -> { success: true, settings: { imageUrl, clickUrl, enabled } }
//   PUT /api/admin/home-banner  <- { imageUrl, clickUrl, enabled }
// analyticsService methods are shown in the accompanying integration notes.

import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "react-query";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  CloudUploadOutlined as CloudUploadOutlinedIcon,
  ContentCopyOutlined as ContentCopyOutlinedIcon,
  ImageOutlined as ImageOutlinedIcon,
  LinkOutlined as LinkOutlinedIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";

import { analyticsService } from "../services/analyticsService";

const DEFAULT_FORM = {
  imageUrl: "",
  clickUrl: "",
  enabled: false,
};

const isHttpsUrl = (value) => {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
};

const extractSettings = (response) =>
  response?.settings ??
  response?.banner ??
  response?.data?.settings ??
  response?.data?.banner ??
  response?.data ??
  {};

export default function HomeBannerManagement() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const { data, isLoading, isFetching, refetch } = useQuery(
    ["adminHomeBanner"],
    () => analyticsService.getHomeBanner(),
    { refetchOnWindowFocus: false, retry: 1 },
  );

  useEffect(() => {
    if (!data) return;
    const settings = extractSettings(data);
    setForm({
      imageUrl: settings.imageUrl || "",
      clickUrl: settings.clickUrl || "",
      enabled: settings.enabled === true,
    });
  }, [data]);

  const imageUrlValid = useMemo(
    () => !form.imageUrl.trim() || isHttpsUrl(form.imageUrl),
    [form.imageUrl],
  );
  const clickUrlValid = useMemo(
    () => !form.clickUrl.trim() || isHttpsUrl(form.clickUrl),
    [form.clickUrl],
  );

  const setField = (field) => (event) => {
    const value =
      field === "enabled" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event?.preventDefault?.();

    const imageUrl = form.imageUrl.trim();
    const clickUrl = form.clickUrl.trim();

    if (form.enabled && !imageUrl) {
      toast.error("Banner enable karne ke liye image URL required hai.");
      return;
    }
    if (imageUrl && !isHttpsUrl(imageUrl)) {
      toast.error("Image URL valid HTTPS URL hona chahiye.");
      return;
    }
    if (clickUrl && !isHttpsUrl(clickUrl)) {
      toast.error("Click link valid HTTPS URL hona chahiye.");
      return;
    }

    try {
      setSaving(true);
      const response = await analyticsService.updateHomeBanner({
        imageUrl,
        clickUrl,
        enabled: Boolean(form.enabled),
      });
      toast.success(response?.message || "Home banner settings saved.");
      await refetch();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Banner settings save nahi ho sake.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Banner settings refreshed.");
    } catch {
      toast.error("Banner settings refresh nahi ho sake.");
    }
  };

  const openUrl = (value) => {
    if (!isHttpsUrl(value)) return;
    window.open(value.trim(), "_blank", "noopener,noreferrer");
  };

  const copyUrl = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("URL copied.");
    } catch {
      toast.error("URL copy nahi ho saka.");
    }
  };

  if (isLoading) {
    return (
      <Box p={2}>
        <LinearProgress />
        <Typography color="text.secondary" mt={2}>
          Loading banner settings…
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Home Banner Management | Admin</title>
      </Helmet>

      <Box sx={{ maxWidth: 1440, mx: "auto", pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
              <ImageOutlinedIcon color="primary" />
              <Typography variant="h4" fontWeight={800}>
                Home Banner Management
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              Flutter app ke home screen banner ki image, click destination aur
              visibility yahan se manage karein.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isFetching || saving}
          >
            Refresh
          </Button>
        </Box>

        {isFetching && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Cloudflare par hosted image ka direct HTTPS URL paste karein. Save
          karne ke baad enabled banner Flutter home screen par category chips ke
          upar dikhna chahiye, agar app mein public banner API integration
          complete hai.
        </Alert>

        <Box
          component="form"
          onSubmit={handleSave}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.1fr) minmax(360px, 0.9fr)",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" spacing={1.25} alignItems="center" mb={2}>
                <CloudUploadOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={750}>
                    Banner configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Image URL, click link aur display status set karein.
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                label="Banner image URL"
                placeholder="https://images.example.com/aapkakaam-banner.webp"
                value={form.imageUrl}
                onChange={setField("imageUrl")}
                error={!imageUrlValid}
                helperText={
                  !imageUrlValid
                    ? "Valid HTTPS image URL enter karein."
                    : "Cloudflare image ka direct HTTPS URL paste karein."
                }
                required={form.enabled}
                InputProps={{
                  endAdornment: form.imageUrl ? (
                    <Tooltip title="Copy image URL">
                      <Button
                        size="small"
                        onClick={() => copyUrl(form.imageUrl)}
                        sx={{ minWidth: 40 }}
                      >
                        <ContentCopyOutlinedIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  ) : null,
                }}
                sx={{ mb: 2.5 }}
              />

              <TextField
                fullWidth
                label="Banner click destination URL"
                placeholder="https://aapkakaam.com/some-page"
                value={form.clickUrl}
                onChange={setField("clickUrl")}
                error={!clickUrlValid}
                helperText={
                  !clickUrlValid
                    ? "Valid HTTPS destination URL enter karein."
                    : "User banner par tap karega to ye link open hoga. Optional."
                }
                InputProps={{
                  endAdornment: form.clickUrl ? (
                    <Tooltip title="Open destination">
                      <Button
                        size="small"
                        onClick={() => openUrl(form.clickUrl)}
                        sx={{ minWidth: 40 }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  ) : null,
                }}
                sx={{ mb: 2.5 }}
              />

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: form.enabled ? "success.50" : "action.hover",
                  borderColor: form.enabled ? "success.light" : "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography fontWeight={750}>Show banner in app</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.enabled
                        ? "Banner enabled hai. Save karne par public API ise serve karegi."
                        : "Banner disabled hai aur app mein display nahi hona chahiye."}
                    </Typography>
                  </Box>
                  <FormControlLabel
                    sx={{ mr: 0 }}
                    control={
                      <Switch
                        color="success"
                        checked={form.enabled}
                        onChange={setField("enabled")}
                      />
                    }
                    label={
                      <Chip
                        size="small"
                        color={form.enabled ? "success" : "default"}
                        label={form.enabled ? "ENABLED" : "DISABLED"}
                      />
                    }
                  />
                </Stack>
              </Paper>

              {form.enabled && !form.imageUrl.trim() && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Banner enable hai, lekin image URL abhi blank hai. Save karne
                  se pehle image URL add karein.
                </Alert>
              )}

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={1.5}
                justifyContent="flex-end"
                mt={3}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    const settings = extractSettings(data);
                    setForm({
                      imageUrl: settings.imageUrl || "",
                      clickUrl: settings.clickUrl || "",
                      enabled: settings.enabled === true,
                    });
                  }}
                  disabled={saving}
                >
                  Reset changes
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={
                    saving ||
                    !imageUrlValid ||
                    !clickUrlValid ||
                    (form.enabled && !form.imageUrl.trim())
                  }
                >
                  {saving ? "Saving…" : "Save banner settings"}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" spacing={1.25} alignItems="center" mb={1}>
                <VisibilityOutlinedIcon color="primary" />
                <Box>
                  <Typography variant="h6" fontWeight={750}>
                    Live preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approximate Flutter banner preview
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  bgcolor: "#f3f4f6",
                  borderRadius: 3,
                  p: { xs: 1.5, sm: 2.5 },
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    maxWidth: 380,
                    mx: "auto",
                    p: 1.5,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    mb={1.5}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 800,
                      }}
                    >
                      A
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={800}>
                        Aapkakaam
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        aapka kaam yani humara kaam
                      </Typography>
                    </Box>
                  </Stack>

                  {form.imageUrl.trim() && imageUrlValid ? (
                    <Box
                      onClick={() =>
                        form.clickUrl.trim() && openUrl(form.clickUrl)
                      }
                      role={form.clickUrl.trim() ? "link" : undefined}
                      sx={{
                        width: "100%",
                        aspectRatio: "16 / 6",
                        borderRadius: 2,
                        overflow: "hidden",
                        cursor: form.clickUrl.trim() ? "pointer" : "default",
                        bgcolor: "action.hover",
                      }}
                    >
                      <Box
                        component="img"
                        src={form.imageUrl.trim()}
                        alt="Home banner preview"
                        onLoad={() => setPreviewError(false)}
                        onError={(event) => {
                          console.error(
                            "Banner image failed:",
                            event.currentTarget.src,
                          );
                          setPreviewError(true);
                        }}
                        sx={{
                          width: "100%",
                          aspectRatio: "16 / 6",
                          objectFit: "cover",
                          borderRadius: 2,
                          display: previewError ? "none" : "block",
                        }}
                      />

                      {previewError && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          Image load nahi hui. R2 URL, public access aur object
                          filename check karein.
                        </Alert>
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "16 / 6",
                        border: "1px dashed",
                        borderColor: "divider",
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: "action.hover",
                        px: 2,
                        textAlign: "center",
                      }}
                    >
                      <Box>
                        <ImageOutlinedIcon
                          color="disabled"
                          sx={{ fontSize: 34 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {form.enabled
                            ? "Image URL add karein"
                            : "Banner disabled hai"}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    mt={1.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {["All", "Home", "Repair", "Cleaning"].map((label) => (
                      <Chip
                        key={label}
                        size="small"
                        label={label}
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                </Paper>
              </Box>

              <Stack spacing={1.25} mt={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {form.enabled ? (
                    <CheckCircleOutlineIcon color="success" fontSize="small" />
                  ) : (
                    <ImageOutlinedIcon color="disabled" fontSize="small" />
                  )}
                  <Typography variant="body2">
                    Display status:{" "}
                    <strong>{form.enabled ? "Enabled" : "Disabled"}</strong>
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                  <LinkOutlinedIcon color="action" fontSize="small" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {form.clickUrl.trim()
                      ? `Tap destination: ${form.clickUrl.trim()}`
                      : "No click destination set; banner tap will do nothing."}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
