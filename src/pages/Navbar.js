//src/pages/Navbar.js
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, ListItemIcon } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const Navbar = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
 
  // const accessRole = localStorage.getItem("accessRole");

  const handleMenuClose = () => setAnchorEl(null);
  const handleCreateUser = () => { handleMenuClose(); navigate("/create-user"); };
  const handleLogout = () => {
    // Remove authentication-related data
    localStorage.removeItem("token"); 
    localStorage.removeItem("isLoggedIn"); 
    localStorage.removeItem("user"); 
    localStorage.removeItem("userToken"); 

    // Optional: Clear everything, but ensure you don’t remove necessary app state
    // localStorage.clear(); 

    // Close menu if function exists
    if (typeof handleMenuClose === "function") {
        handleMenuClose();
    }

    // Redirect to login page
    navigate("/");
};


  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#1E293B", top: 0, zIndex: 1100 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}>
            SRIFIN ASSET MANAGEMENT
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircleIcon sx={{ fontSize: 30 }} />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
            <MenuItem onClick={handleCreateUser}><ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>Create User</MenuItem>
            <MenuItem onClick={handleLogout}><ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>Log Out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </>
  );
};

export default Navbar;