import React, { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { logout } from "../GlobalSlice"; // ✅ Adjust path if needed
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";

const NavBar = () => {
  const theme = useTheme();
  const location = useLocation();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.data.isLoggedIn);
  const role = useSelector((state) => state.data.role);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const isAdmin = role === "Admin";
  const isManager = role === "RestaurantManager";
  const isCustomer = role === "Customer";

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const currentPath = location.pathname;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogOut = () => {
  sessionStorage.clear();
  dispatch(logout());
  setShowLogoutMessage(true);
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500); // slight delay for user to see message
};

  
  const adminNavLinks = [
    { name: "Home", path: "/" },
    { name: "Manage Restaurants", path: "/admin" },
    { name: "Remove Restaurants", path: "/admin/manage-restaurants" },
    { name: "Analytics Dashboard", path: "/dashboard" },
  ];

  const managerNavLinks = [
    { name: "Home", path: "/" },
    { name: "Manager Panel", path: "/manager" },
  ];

  const customerNavLinks = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "My Bookings", path: "/mybookings" },
  ];

  const defaultNavLinks = [
    { name: "Home", path: "/" },
    { name: "Search", path: "/search" },
    { name: "Login", path: "/login" },
    { name: "Register", path: "/register" },
  ];

  const roleNavLinks =
    isAdmin
      ? adminNavLinks
      : isManager
      ? managerNavLinks
      : isCustomer
      ? customerNavLinks
      : defaultNavLinks;

  const filteredNavLinks = roleNavLinks.filter(
    (link) => !isLoggedIn || (link.name !== "Login" && link.name !== "Register")
  );

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: "#fff", color: "#000" }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".1rem",
              color: "inherit",
              textDecoration: "none",
              fontSize: "1.5rem",
            }}
          >
            Bookatable
          </Typography>

          {/* Desktop View */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              {filteredNavLinks.map((link) => (
                <Button
                  key={link.name}
                  component="a"
                  href={link.path}
                  sx={{
                    textTransform: "none",
                    color: currentPath === link.path ? "#1976d2" : "#333",
                    fontWeight: currentPath === link.path ? "bold" : "normal",
                    borderBottom: currentPath === link.path ? "2px solid #1976d2" : "none",
                    fontSize: "0.95rem",
                    borderRadius: 0,
                    px: 2,
                  }}
                >
                  {link.name}
                </Button>
              ))}
              {isLoggedIn && (
                <Button
                  onClick={handleLogOut}
                  sx={{
                    textTransform: "none",
                    color: "red",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                >
                  Logout
                </Button>
              )}
            </Box>
          )}

          {/* Mobile View */}
          {isMobile && (
            <Box>
              <IconButton size="large" onClick={handleMenu} color="inherit">
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {filteredNavLinks.map((link) => (
                  <MenuItem
                    key={link.name}
                    component="a"
                    href={link.path}
                    onClick={handleClose}
                    sx={{
                      color: currentPath === link.path ? "#1976d2" : "#000",
                      fontWeight: currentPath === link.path ? "bold" : "normal",
                    }}
                  >
                    <Typography textAlign="center">{link.name}</Typography>
                  </MenuItem>
                ))}

                {isLoggedIn && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleLogOut();
                    }}
                  >
                    <Typography textAlign="center" sx={{ color: "red" }}>
                      Logout
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
      <Snackbar
        open={showLogoutMessage}
        autoHideDuration={3000}
        onClose={() => setShowLogoutMessage(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowLogoutMessage(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          You’ve been logged out successfully.
        </Alert>
      </Snackbar>

    </AppBar>
  );
};

export default NavBar;
