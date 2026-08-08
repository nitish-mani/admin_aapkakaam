import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Box, Typography, Button, Paper, Container } from "@mui/material";
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found</title>
      </Helmet>
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paper
            sx={{ p: 6, textAlign: "center", maxWidth: 500, width: "100%" }}
          >
            <Box
              sx={{
                fontSize: 80,
                fontWeight: 800,
                color: "primary.main",
                mb: 2,
              }}
            >
              404
            </Box>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
              Oops! The page you're looking for doesn't exist.
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                component={Link}
                to="/"
              >
                Go Home
              </Button>
              <Button
                variant="outlined"
                startIcon={<DashboardIcon />}
                component={Link}
                to="/dashboard"
              >
                Dashboard
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default NotFoundPage;
