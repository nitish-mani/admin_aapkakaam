import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CurrencyRupee as RupeeIcon,
} from "@mui/icons-material";
import { analyticsService } from "../services/analyticsService";

const DEFAULT_FEES = {
  userAmountRupees: 0,
  vendorAmountRupees: 50,
};

const extractRupees = (config, type) => {
  const direct = config?.[`${type}AmountRupees`];

  if (direct !== undefined && direct !== null) {
    return Number(direct);
  }

  const paise = config?.[`${type}AmountPaise`];

  if (paise !== undefined && paise !== null) {
    return Number(paise) / 100;
  }

  const nested = config?.[type];

  if (nested?.amountRupees !== undefined) {
    return Number(nested.amountRupees);
  }

  if (nested?.amountPaise !== undefined) {
    return Number(nested.amountPaise) / 100;
  }

  return DEFAULT_FEES[`${type}AmountRupees`];
};

export default function SignupFeeManagement() {
  const [fees, setFees] = useState(DEFAULT_FEES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadFees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await analyticsService.getAdminSignupFees();

      if (response?.success === false) {
        throw new Error(response.message || "Failed to load signup fees.");
      }

      const config =
        response?.fees ?? response?.data?.fees ?? response?.data ?? response;

      setFees({
        userAmountRupees: extractRupees(config, "user"),
        vendorAmountRupees: extractRupees(config, "vendor"),
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load signup fees. Please check the backend API.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const handleAmountChange = (type, value) => {
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setFees((previous) => ({
        ...previous,
        [`${type}AmountRupees`]: value,
      }));
    }
  };

  const handleFreeChange = (type, isFree) => {
    setFees((previous) => {
      const key = `${type}AmountRupees`;
      const currentAmount = Number(previous[key]);

      return {
        ...previous,
        [key]: isFree
          ? 0
          : currentAmount > 0
            ? currentAmount
            : type === "user"
              ? 10
              : 50,
      };
    });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const userAmount = Number(fees.userAmountRupees);
    const vendorAmount = Number(fees.vendorAmountRupees);

    if (
      fees.userAmountRupees === "" ||
      fees.vendorAmountRupees === "" ||
      !Number.isFinite(userAmount) ||
      !Number.isFinite(vendorAmount) ||
      userAmount < 0 ||
      vendorAmount < 0
    ) {
      setError("Please enter valid non-negative signup fees.");
      return;
    }

    setSaving(true);

    try {
      const response = await analyticsService.updateAdminSignupFees({
        userAmountRupees: userAmount,
        vendorAmountRupees: vendorAmount,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to save signup fees.");
      }

      setSuccess("Signup fees updated successfully.");
      await loadFees();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save signup fees.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Signup Fee Management
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Manage registration fees for users and service providers.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadFees}
          disabled={saving}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <RupeeIcon color="primary" fontSize="large" />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  User Signup Fee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registration fee for customers
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={Number(fees.userAmountRupees) === 0}
                  onChange={(event) =>
                    handleFreeChange("user", event.target.checked)
                  }
                  disabled={saving}
                />
              }
              label={
                Number(fees.userAmountRupees) === 0
                  ? "Free signup enabled"
                  : "Enable free signup"
              }
            />

            <TextField
              fullWidth
              label="User Signup Fee (₹)"
              type="number"
              value={fees.userAmountRupees}
              onChange={(event) =>
                handleAmountChange("user", event.target.value)
              }
              disabled={saving || Number(fees.userAmountRupees) === 0}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Enter 0 to make user registration free."
              sx={{ mt: 2 }}
            />

            <Paper
              variant="outlined"
              sx={{ mt: 2, p: 2, bgcolor: "action.hover" }}
            >
              <Typography variant="body2" color="text.secondary">
                Current fee
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                ₹{(Number(fees.userAmountRupees) || 0).toFixed(2)}
              </Typography>
            </Paper>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <RupeeIcon color="secondary" fontSize="large" />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Vendor Signup Fee
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registration fee for service providers
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={Number(fees.vendorAmountRupees) === 0}
                  onChange={(event) =>
                    handleFreeChange("vendor", event.target.checked)
                  }
                  disabled={saving}
                />
              }
              label={
                Number(fees.vendorAmountRupees) === 0
                  ? "Free signup enabled"
                  : "Enable free signup"
              }
            />

            <TextField
              fullWidth
              label="Vendor Signup Fee (₹)"
              type="number"
              value={fees.vendorAmountRupees}
              onChange={(event) =>
                handleAmountChange("vendor", event.target.value)
              }
              disabled={saving || Number(fees.vendorAmountRupees) === 0}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Enter 0 to make vendor registration free."
              sx={{ mt: 2 }}
            />

            <Paper
              variant="outlined"
              sx={{ mt: 2, p: 2, bgcolor: "action.hover" }}
            >
              <Typography variant="body2" color="text.secondary">
                Current fee
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                ₹{(Number(fees.vendorAmountRupees) || 0).toFixed(2)}
              </Typography>
            </Paper>
          </CardContent>
        </Card>
      </Box>

      <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Before saving
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Saving this page updates the fee configuration through the admin API.
          The backend must also use this configuration when creating signup
          payment orders and handling free registrations.
        </Typography>
      </Paper>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={
            saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Signup Fees"}
        </Button>
      </Stack>
    </Box>
  );
}
