import React, { useState, useEffect, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  Box,
  Divider,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import SrifinLogo from "../assets/srifin_final.svg";

const logoutMenuItemSx = {
  backgroundColor: "#ef4444",
  color: "#fff",
  borderRadius: 1,
  px: 2,
  py: 1,
  mx: 1,
  my: 0.5,
  "&:hover": {
    backgroundColor: "#dc2626",
  },
};

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState(null);
  const [id, setId] = useState(null);

  const allowedModules = useMemo(() => {
    return JSON.parse(localStorage.getItem("allowedModules")) || [];
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setName(user.name);
      setId(user.emp_id);

      if (process.env.NODE_ENV === "development") {
        console.log("name", user.name);
        console.log("emp_id", user.emp_id);
      }
    }
  }, []);

  const handleMenuClose = () => setAnchorEl(null);

  const handleCreateUser = () => {
    handleMenuClose();
    navigate("/create-user");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    localStorage.removeItem("allowedModules");

    handleMenuClose();
    navigate("/");
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{ backgroundColor: "#1E293B", top: 0, zIndex: 1100 }}
      >
        <Toolbar sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <img
            src={SrifinLogo}
            alt="Srifin Logo"
            style={{
              width: 160,
              height: 40,
              backgroundColor: "white",
              padding: "5px 0px",
              borderRadius: "8px",
              marginRight: 16, // spacing between logo and title
            }}
          />

          <Typography
            variant="h6"
            sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}
          >
            ASSET MANAGEMENT
          </Typography>

          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            aria-controls={Boolean(anchorEl) ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl) ? "true" : undefined}
            aria-label="account menu"
          >
            <AccountCircleIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Menu
            id="account-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            sx={{ mt: 1 }}
            MenuListProps={{ "aria-labelledby": "account-menu-button" }}
          >
            <MenuItem onClick={handleCreateUser} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <AssignmentIndIcon fontSize="small" />
              </ListItemIcon>
              <Box sx={{ display: "flex", flexDirection: "column", ml: 1 }}>
                <Typography variant="subtitle2" color="text.primary" noWrap>
                  {name || "Guest"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  ID: {id || "N/A"}
                </Typography>
              </Box>
            </MenuItem>

            <Divider
              sx={{
                my: 0.5,
                borderColor: "rgba(0,0,0,0.2)",
                borderBottomWidth: "1px",
              }}
            />

            <MenuItem onClick={handleLogout} sx={logoutMenuItemSx}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 32 }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body1" fontWeight={500}>
                Log Out
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        allowedModules={allowedModules}
      />
    </>
  );
};

export default Navbar;
