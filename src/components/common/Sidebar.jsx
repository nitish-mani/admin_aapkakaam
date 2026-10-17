import React from "react";
import { NavLink } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Store as StoreIcon,
  Bookmark as BookmarkIcon,
  TrendingUp as TrendingUpIcon,
  Share as ShareIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  PersonSearch as PersonSearchIcon,
  Storefront as StorefrontIcon,
  Message as MessageIcon,
  SystemUpdate as SystemUpdateIcon,
  MonitorHeart as MonitorHeartIcon,
  ImageOutlined as ImageOutlinedIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 280;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const NavItem = styled(ListItem)(({ theme, active }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  backgroundColor: active ? theme.palette.primary.main : "transparent",
  color: active ? "#ffffff" : theme.palette.text.primary,
  "&:hover": {
    backgroundColor: active
      ? theme.palette.primary.dark
      : theme.palette.action.hover,
  },
  "& .MuiListItemIcon-root": {
    color: active ? "#ffffff" : theme.palette.text.secondary,
    minWidth: 40,
  },
}));

const menuItems = [
  { path: "/dashboard", icon: DashboardIcon, label: "Dashboard" },
  { path: "/users", icon: PeopleIcon, label: "Users Analytics" },
  {
    path: "/user-management",
    icon: PersonSearchIcon,
    label: "User Management",
  },
  { path: "/vendors", icon: StoreIcon, label: "Vendor Analytics" },
  {
    path: "/vendor-management",
    icon: StorefrontIcon,
    label: "Vendor Management",
  },
  { path: "/bookings", icon: BookmarkIcon, label: "Bookings" },
  { path: "/revenue", icon: TrendingUpIcon, label: "Revenue" },
  { path: "/referrals", icon: ShareIcon, label: "Referrals" },
  { path: "/concerns", icon: MessageIcon, label: "Concerns" },
  {
    path: "/app-version",
    icon: SystemUpdateIcon,
    label: "App Version",
  },

  { path: "/system-status", icon: MonitorHeartIcon, label: "System Status" },
  { path: "/settings", icon: SettingsIcon, label: "Settings" },
  {
    path: "/home-banner",
    icon: ImageOutlinedIcon,
    label: "Home Banner",
  },
];

const Sidebar = ({ open, handleDrawerClose }) => {
  const { admin } = useAuth();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          border: "none",
          backgroundColor: "background.default",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <DrawerHeader>
        <Box
          sx={{ flex: 1, px: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <AdminIcon color="primary" />
          <Typography variant="h6" fontWeight={700} color="primary">
            Admin
          </Typography>
          <Chip label="v2.0" size="small" variant="outlined" />
        </Box>
        <IconButton onClick={handleDrawerClose}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>
      <Divider />

      {admin && (
        <Box sx={{ px: 2, py: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: "primary.main",
              color: "white",
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Logged in as
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {admin.name || "Admin"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {admin.email || ""}
            </Typography>
          </Box>
        </Box>
      )}

      <Divider />

      <Box sx={{ mt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {({ isActive }) => (
                <Tooltip title={item.label} placement="right" arrow>
                  <NavItem active={isActive}>
                    <ListItemIcon>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </NavItem>
                </Tooltip>
              )}
            </NavLink>
          ))}
        </List>
      </Box>
      <Box sx={{ flexGrow: 1 }} />

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography
          variant="caption"
          color="textSecondary"
          align="center"
          display="block"
        >
          © {new Date().getFullYear()} Uslugi Technology Pvt. Ltd.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
