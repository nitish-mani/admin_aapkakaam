import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Fade,
  Zoom,
  Divider,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Verified,
  CheckCircle,
  Shield,
  Security,
  Smartphone,
  AccountCircle,
  Login,
  Key,
  LockReset,
  ArrowBack,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { Helmet } from "react-helmet-async";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CATEGORY = "admin";

// Password strength indicator component
const PasswordStrength = ({ password }) => {
  if (!password) return null;

  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[@$!%*?&#]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["#ff4444", "#ffbb33", "#00c851", "#33b5e5"];
  const percentage = (strength / 4) * 100;

  return (
    <Box sx={{ mt: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          Password Strength:
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: colors[strength - 1] || "#666" }}
        >
          {labels[strength - 1] || "Weak"}
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          height: 4,
          bgcolor: "#e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${percentage}%`,
            height: "100%",
            bgcolor: colors[strength - 1] || "#ff4444",
            transition: "width 0.3s ease",
          }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
        {["Lowercase", "Uppercase", "Number", "Special"].map((req, index) => {
          const isMet =
            password.length > 0 &&
            ((index === 0 && /[a-z]/.test(password)) ||
              (index === 1 && /[A-Z]/.test(password)) ||
              (index === 2 && /\d/.test(password)) ||
              (index === 3 && /[@$!%*?&#]/.test(password)));
          return (
            <Typography
              key={req}
              variant="caption"
              sx={{
                color: isMet ? "#00c851" : "#999",
                fontSize: "10px",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {isMet ? "✅" : "⬜"} {req}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Forget Password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPhoneNo, setForgotPhoneNo] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotOtpId, setForgotOtpId] = useState("");
  const [forgotIsOtpSent, setForgotIsOtpSent] = useState(false);
  const [forgotIsPhoneOtpLoading, setForgotIsPhoneOtpLoading] = useState(false);
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password

  // OTP states
  const [otpId, setOtpId] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneOtpLoading, setIsPhoneOtpLoading] = useState(false);
  const [verifyPhoneNo, setVerifyPhoneNo] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phoneNo: "",
    otp: "",
  });

  const [validation, setValidation] = useState({
    isNameEmpty: true,
    isNumValid: true,
    isPassValid: true,
    isValidPass: true,
  });

  const steps = ["Personal Info", "Verify Phone", "Create Password"];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccess("");
    if (newValue === 0) {
      setVerifyPhoneNo(false);
      setIsOtpSent(false);
      setOtpId("");
      setFormData((prev) => ({ ...prev, otp: "" }));
      setActiveStep(0);
    } else {
      setActiveStep(0);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "name") {
      setValidation((prev) => ({ ...prev, isNameEmpty: true }));
    }
    if (e.target.name === "phoneNo") {
      setValidation((prev) => ({ ...prev, isNumValid: true }));
    }
    if (e.target.name === "password") {
      setValidation((prev) => ({
        ...prev,
        isPassValid: true,
        isValidPass: true,
      }));
    }
  };

  const showMessage = (type, message, duration = 5000) => {
    if (type === "success") {
      setSuccess(message);
      setError("");
      setTimeout(() => setSuccess(""), duration);
    } else {
      setError(message);
      setSuccess("");
      setTimeout(() => setError(""), duration);
    }
  };

  // Phone verification handler
  const handlePhoneVerify = useCallback(async () => {
    if (!navigator.onLine) {
      showMessage("err", "You are offline");
      return;
    }

    if (!isOtpSent) {
      if (!/^\d{10}$/.test(formData.phoneNo)) {
        setValidation((prev) => ({ ...prev, isNumValid: false }));
        showMessage("err", "Mobile Number must be 10 digits");
        return;
      }

      setIsPhoneOtpLoading(true);

      try {
        const res = await axios.post(
          `${SERVER_URL}/${CATEGORY}/phoneVerification`,
          {
            phoneNo: formData.phoneNo,
          },
        );
        if (res.data.verified) {
          setOtpId(res.data.otpId);
          setIsOtpSent(true);
          showMessage("success", "OTP sent to your phone!", 2000);
          setActiveStep(1);
        } else {
          showMessage("err", res.data.message || "Phone verification failed");
        }
      } catch (error) {
        showMessage(
          "err",
          error.response?.data?.message || "Phone verification failed",
        );
      } finally {
        setIsPhoneOtpLoading(false);
      }
    } else {
      if (!formData.otp || formData.otp.length !== 6) {
        showMessage("err", "Please enter a valid 6-digit OTP");
        return;
      }

      setIsPhoneOtpLoading(true);

      try {
        const res = await axios.post(
          `${SERVER_URL}/${CATEGORY}/otpVerification`,
          {
            otp: formData.otp,
            otpId: otpId,
          },
        );

        if (res.data.verified) {
          setVerifyPhoneNo(true);
          setIsOtpSent(false);
          setFormData((prev) => ({ ...prev, otp: "" }));
          showMessage("success", "Phone verified successfully!", 2000);
          setActiveStep(2);
        } else {
          showMessage("err", res.data.message || "OTP verification failed");
        }
      } catch (error) {
        showMessage(
          "err",
          error.response?.data?.message || "OTP verification failed",
        );
      } finally {
        setIsPhoneOtpLoading(false);
      }
    }
  }, [formData.phoneNo, formData.otp, otpId, isOtpSent]);

  // Forget Password Handlers
  const handleForgotPhoneVerify = async () => {
    if (!navigator.onLine) {
      showMessage("err", "You are offline");
      return;
    }

    if (!forgotIsOtpSent) {
      if (!/^\d{10}$/.test(forgotPhoneNo)) {
        setError("Mobile Number must be 10 digits");
        setTimeout(() => setError(""), 3000);
        return;
      }

      setForgotIsPhoneOtpLoading(true);

      try {
        const res = await axios.post(
          `${SERVER_URL}/${CATEGORY}/phoneVerificationPasswordReset`,
          {
            phoneNo: forgotPhoneNo,
            changingPass: true,
          },
        );
        setForgotOtpId(res.data.otpId);
        setSuccess("OTP sent successfully");
        setForgotIsPhoneOtpLoading(false);
        setForgotIsOtpSent(true);
        setForgotStep(2);
        setTimeout(() => setSuccess(""), 2000);
      } catch (err) {
        setForgotIsPhoneOtpLoading(false);
        setError(err.response?.data?.message || "Failed to send OTP");
        setTimeout(() => setError(""), 3000);
      }
    } else {
      if (!forgotOtp || forgotOtp.length !== 6) {
        setError("Please enter a valid 6-digit OTP");
        setTimeout(() => setError(""), 3000);
        return;
      }

      setForgotIsPhoneOtpLoading(true);

      try {
        const res = await axios.post(
          `${SERVER_URL}/${CATEGORY}/otpVerificationResetPassword`,
          {
            otp: forgotOtp,
            otpId: forgotOtpId,
          },
        );

        if (res.data.verify) {
          setForgotOtpVerified(true);
          setForgotIsOtpSent(true);
          setForgotIsPhoneOtpLoading(false);
          setForgotStep(3);
          setSuccess("OTP verified successfully");
          setTimeout(() => setSuccess(""), 2000);
        } else {
          setError(res.data.message || "OTP verification failed");
          setForgotIsPhoneOtpLoading(false);
          setTimeout(() => setError(""), 3000);
        }
      } catch (err) {
        setForgotIsPhoneOtpLoading(false);
        setError(err.response?.data?.message || "OTP verification failed");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleForgotPasswordUpdate = async () => {
    if (!forgotPassword || forgotPassword.length < 6) {
      setError("Password length must be greater than 6 characters");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const regexPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!regexPass.test(forgotPassword)) {
      setError(
        "Password must contain uppercase, lowercase, number and special character",
      );
      setTimeout(() => setError(""), 3000);
      return;
    }

    setForgotIsPhoneOtpLoading(true);

    try {
      const res = await axios.patch(`${SERVER_URL}/${CATEGORY}/edit/password`, {
        phoneNo: forgotPhoneNo,
        password: forgotPassword,
        otpId: forgotOtpId,
      });

      setSuccess("Password updated successfully!");
      setForgotIsPhoneOtpLoading(false);
      setForgotIsOtpSent(false);

      setTimeout(() => {
        setForgotPasswordOpen(false);
        setSuccess("");
        // Reset forgot password states
        setForgotPhoneNo("");
        setForgotOtp("");
        setForgotPassword("");
        setForgotOtpId("");
        setForgotIsOtpSent(false);
        setForgotOtpVerified(false);
        setForgotStep(1);
        navigate("/login");
      }, 2000);
    } catch (err) {
      setForgotIsPhoneOtpLoading(false);
      setError(err.response?.data?.message || "Failed to update password");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation checks
    if (!formData.name.trim()) {
      setValidation((prev) => ({ ...prev, isNameEmpty: false }));
      showMessage("err", "Full name is required");
      return;
    }

    if (!/^\d{10}$/.test(formData.phoneNo)) {
      setValidation((prev) => ({ ...prev, isNumValid: false }));
      showMessage("err", "Mobile Number must be 10 digits");
      return;
    }

    if (!verifyPhoneNo) {
      showMessage("err", "Please verify your phone number first");
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setValidation((prev) => ({
        ...prev,
        isPassValid: false,
      }));
      showMessage("err", "Password must be at least 8 characters");
      return;
    }

    const regexPass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!regexPass.test(formData.password)) {
      setValidation((prev) => ({ ...prev, isValidPass: false }));
      showMessage(
        "err",
        "Password must contain uppercase, lowercase, number and special character",
      );
      return;
    }

    if (!navigator.onLine) {
      showMessage("err", "You are offline");
      return;
    }

    setLoading(true);
    try {
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNo: formData.phoneNo,
        password: formData.password,
        validPhoneNoId: otpId,
        agreedToTnCnP: true,
      });

      setLoading(false);

      if (result.success) {
        showMessage("success", "🎉 Admin account created successfully!", 3000);
        setTimeout(() => {
          setTabValue(0);
          setFormData({
            email: formData.email,
            password: "",
            name: "",
            phoneNo: "",
            otp: "",
          });
          setVerifyPhoneNo(false);
          setIsOtpSent(false);
          setOtpId("");
          setActiveStep(0);
        }, 3000);
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (err) {
      setLoading(false);
      showMessage("err", err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Admin Panel</title>
      </Helmet>

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 4,
          position: "relative",
        }}
      >
        <Container maxWidth="sm">
          <Fade in timeout={500}>
            <Paper
              elevation={24}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                backgroundColor: "background.paper",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <Box textAlign="center" mb={4}>
                <Zoom in timeout={500}>
                  <Box>
                    <Shield
                      sx={{
                        fontSize: 48,
                        color: "primary.main",
                        mb: 1,
                      }}
                    />
                    <Typography
                      variant="h4"
                      fontWeight={800}
                      gutterBottom
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Admin Panel
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {tabValue === 0
                        ? "Welcome back! Sign in to access the dashboard"
                        : "Create your admin account and get started"}
                    </Typography>
                  </Box>
                </Zoom>
              </Box>

              {/* Tabs */}
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                sx={{
                  mb: 3,
                  "& .MuiTab-root": {
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "1rem",
                    minHeight: 48,
                  },
                }}
              >
                <Tab icon={<Login />} label="Login" iconPosition="start" />
                <Tab
                  icon={<AccountCircle />}
                  label="Signup"
                  iconPosition="start"
                />
              </Tabs>

              {/* Messages */}
              <Collapse in={!!error || !!success}>
                {(error || success) && (
                  <Alert
                    severity={success ? "success" : "error"}
                    sx={{ mb: 3, borderRadius: 2 }}
                    onClose={() => {
                      setError("");
                      setSuccess("");
                    }}
                    icon={success ? <CheckCircle /> : undefined}
                  >
                    {error || success}
                  </Alert>
                )}
              </Collapse>

              {tabValue === 0 ? (
                // LOGIN FORM
                <form onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    margin="normal"
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    margin="normal"
                    sx={{ mb: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mb: 2,
                    }}
                  >
                    <Link
                      component="button"
                      type="button"
                      variant="body2"
                      onClick={() => setForgotPasswordOpen(true)}
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a67d8, #6b4190)",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              ) : (
                // SIGNUP FORM
                <form onSubmit={handleSignup}>
                  {/* Stepper */}
                  <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    sx={{ mb: 4, mt: 1 }}
                  >
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>
                          <Typography variant="caption" color="textSecondary">
                            {label}
                          </Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Step 1: Personal Info */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      margin="normal"
                      error={!validation.isNameEmpty}
                      helperText={
                        !validation.isNameEmpty && "Full name is required"
                      }
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      margin="normal"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  {/* Step 2: Phone Verification */}
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box
                      sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                    >
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        required
                        disabled={verifyPhoneNo}
                        error={!validation.isNumValid}
                        helperText={
                          !validation.isNumValid &&
                          "Enter a valid 10-digit phone number"
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Smartphone color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: verifyPhoneNo && (
                            <InputAdornment position="end">
                              <Zoom in>
                                <Verified sx={{ color: "#00c851" }} />
                              </Zoom>
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant={verifyPhoneNo ? "contained" : "outlined"}
                        onClick={handlePhoneVerify}
                        disabled={isPhoneOtpLoading || verifyPhoneNo}
                        sx={{
                          minWidth: "110px",
                          height: "56px",
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          ...(verifyPhoneNo && {
                            bgcolor: "#00c851",
                            color: "white",
                            "&:hover": { bgcolor: "#00a844" },
                          }),
                        }}
                      >
                        {isPhoneOtpLoading ? (
                          <CircularProgress size={24} />
                        ) : verifyPhoneNo ? (
                          "Verified ✓"
                        ) : isOtpSent ? (
                          "Verify OTP"
                        ) : (
                          "Send OTP"
                        )}
                      </Button>
                    </Box>

                    {/* OTP Input */}
                    <Collapse in={isOtpSent && !verifyPhoneNo}>
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Enter OTP"
                          name="otp"
                          value={formData.otp}
                          onChange={handleChange}
                          placeholder="Enter 6-digit OTP"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Key color="action" />
                              </InputAdornment>
                            ),
                          }}
                          helperText="OTP sent to your phone number"
                        />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Didn't receive OTP?{" "}
                          <Button
                            size="small"
                            onClick={() => {
                              setIsOtpSent(false);
                              setOtpId("");
                              setFormData((prev) => ({ ...prev, otp: "" }));
                            }}
                            sx={{ textTransform: "none" }}
                          >
                            Resend
                          </Button>
                        </Typography>
                      </Box>
                    </Collapse>

                    {verifyPhoneNo && (
                      <Alert
                        icon={<Verified />}
                        severity="success"
                        sx={{ mt: 2, borderRadius: 2 }}
                      >
                        Phone number verified successfully!
                      </Alert>
                    )}
                  </Box>

                  {/* Step 3: Password */}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      margin="normal"
                      error={!validation.isPassValid || !validation.isValidPass}
                      helperText={
                        !validation.isPassValid
                          ? "Password must be at least 8 characters"
                          : !validation.isValidPass
                            ? "Must contain uppercase, lowercase, number & special character"
                            : "Create a strong password"
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Security color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <PasswordStrength password={formData.password} />
                  </Box>

                  {/* Submit Button */}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !verifyPhoneNo}
                    sx={{
                      mt: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #5a67d8, #6b4190)",
                      },
                      "&.Mui-disabled": {
                        background: "#e0e0e0",
                        color: "#999",
                      },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  {!verifyPhoneNo && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 2, display: "block", textAlign: "center" }}
                    >
                      <Security
                        sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }}
                      />
                      Please verify your phone number to create an account
                    </Typography>
                  )}
                </form>
              )}

              {/* Footer */}
              <Divider sx={{ mt: 4, mb: 2 }} />
              <Box textAlign="center">
                <Typography variant="caption" color="textSecondary">
                  © {new Date().getFullYear()} AapkaKaam Admin Panel
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    🔒 Secure Connection
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    💳 256-bit Encryption
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Fade>
        </Container>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={() => {
          setForgotPasswordOpen(false);
          setForgotStep(1);
          setForgotIsOtpSent(false);
          setForgotOtpVerified(false);
          setForgotPhoneNo("");
          setForgotOtp("");
          setForgotPassword("");
          setForgotOtpId("");
          setError("");
          setSuccess("");
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <LockReset sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {forgotStep === 1 && "Enter your phone number to receive OTP"}
            {forgotStep === 2 && "Enter the OTP sent to your phone"}
            {forgotStep === 3 && "Create a new password"}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Step 1: Phone Number */}
          {forgotStep === 1 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={forgotPhoneNo}
                onChange={(e) => setForgotPhoneNo(e.target.value)}
                placeholder="Enter 10-digit phone number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                We'll send a password reset OTP to this number
              </Typography>
            </Box>
          )}

          {/* Step 2: OTP Verification */}
          {forgotStep === 2 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Enter OTP"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Key color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                OTP sent to{" "}
                {forgotPhoneNo.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2")}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setForgotIsOtpSent(false);
                  setForgotOtpId("");
                  setForgotOtp("");
                  setForgotStep(1);
                }}
                sx={{ mt: 1, textTransform: "none" }}
                startIcon={<ArrowBack />}
              >
                Back to phone number
              </Button>
            </Box>
          )}

          {/* Step 3: New Password */}
          {forgotStep === 3 && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={forgotPassword}
                onChange={(e) => setForgotPassword(e.target.value)}
                placeholder="Enter new password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <PasswordStrength password={forgotPassword} />
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                Must be 8+ characters with uppercase, lowercase, number &
                special character
              </Typography>
            </Box>
          )}

          {/* Error/Success Messages in Dialog */}
          {(error || success) && (
            <Alert
              severity={success ? "success" : "error"}
              sx={{ mt: 2, borderRadius: 2 }}
              onClose={() => {
                setError("");
                setSuccess("");
              }}
            >
              {error || success}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, flexDirection: "column", gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={
              forgotStep === 1
                ? handleForgotPhoneVerify
                : forgotStep === 2
                  ? handleForgotPhoneVerify
                  : handleForgotPasswordUpdate
            }
            disabled={forgotIsPhoneOtpLoading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a67d8, #6b4190)",
              },
            }}
          >
            {forgotIsPhoneOtpLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : forgotStep === 1 ? (
              "Send OTP"
            ) : forgotStep === 2 ? (
              "Verify OTP"
            ) : (
              "Update Password"
            )}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setForgotPasswordOpen(false);
              setForgotStep(1);
              setForgotIsOtpSent(false);
              setForgotOtpVerified(false);
              setForgotPhoneNo("");
              setForgotOtp("");
              setForgotPassword("");
              setForgotOtpId("");
              setError("");
              setSuccess("");
            }}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginPage;
