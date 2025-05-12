// src/pages/Sidebar.js
import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Assignment,
  Home,
  CloudUpload,
  CheckCircle,
  Build,
  Approval,
  AddCircle,
  MonetizationOn,
  ReceiptLong,
  RequestQuote,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";

// Mapping of module names to their identifiers
const MODULES = {
  HOME: "IT-HOME",
  APPROVAL: "IT-APPROVAL",
  NEW_ASSETS: "IT-NEW ASSETS",
  BULK_UPLOAD: "IT-Bulk Upload",
  ASSET_DEPRECIATION: "IT-Asset Depreciation",
  USER_ROLES: "IT-User Roles",
};

const Sidebar = ({ sidebarOpen, setSidebarOpen, allowedModules = [] }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isModuleAllowed = (moduleName) => allowedModules.includes(moduleName);

  return (
    <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
      <Box
        sx={{
          width: 280,
          backgroundColor: "#1E293B",
          height: "100vh",
          color: "#FFF",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#4B5563", borderRadius: "10px" },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold", padding: 2, textAlign: "center", letterSpacing: 1.2 }}>
          Asset Management
        </Typography>
        <Divider sx={{ backgroundColor: "#FFFFFF" }} />
        <List>
          {isModuleAllowed(MODULES.HOME) && (
            <ListItem button onClick={() => handleNavigate("/DashBoard")} sx={menuItemStyles}>
              <ListItemIcon>
                <Home sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
          )}

          {isModuleAllowed(MODULES.APPROVAL) && (
            <>
              <ListItem button onClick={() => toggleDropdown("approval")} sx={menuItemStyles}>
                <ListItemIcon>
                  <Approval sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="Approval" />
                {activeDropdown === "approval" ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={activeDropdown === "approval"} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {approvalItems.map((item, idx) => (
                    <ListItem key={idx} button sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {isModuleAllowed(MODULES.NEW_ASSETS) && (
            <>
              <ListItem button onClick={() => toggleDropdown("newAssets")} sx={menuItemStyles}>
                <ListItemIcon>
                  <AddCircle sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="New Assets" />
                {activeDropdown === "newAssets" ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={activeDropdown === "newAssets"} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {newAssetsItems.map((item, idx) => (
                    <ListItem key={idx} button sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {isModuleAllowed(MODULES.BULK_UPLOAD) && (
            <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/BulkUpload")}>
              <ListItemIcon>
                <CloudUpload sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="Bulk Upload" />
            </ListItem>
          )}

          {isModuleAllowed(MODULES.ASSET_DEPRECIATION) && (
            <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/new-assets/assetdepreciation")}>
              <ListItemIcon>
                <MonetizationOn sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="Asset Depreciation" />
            </ListItem>
          )}

          {isModuleAllowed(MODULES.USER_ROLES) && (
            <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/user_roles")}>
              <ListItemIcon>
                <GroupIcon sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="User Roles" />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

const approvalItems = [
  { text: "Free Pool", icon: <CheckCircle />, path: "/approval/free-pool" },
  { text: "Assigned", icon: <Assignment />, path: "/approval/assigned" },
  { text: "Under Maintenance", icon: <Build />, path: "/approval/under-maintenance" },
  { text: "Purchase Order", icon: <Approval />, path: "/approval/po" },
  { text: "Invoice", icon: <RequestQuote />, path: "/approval/invoice" },
  { text: "Payment Receipt", icon: <ReceiptLong />, path: "/approval/payment" },
  { text: "Bulk Upload", icon: <CloudUpload />, path: "/approval/bulk" },
];

const newAssetsItems = [
  { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
  { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
  { text: "Upload Payment Receipt", icon: <ReceiptLong />, path: "/new-assets/upload-reciept" },
];

const menuItemStyles = {
  "&:hover": {
    backgroundColor: "#334155",
    transition: "all 0.3s ease-in-out",
    borderRadius: "8px",
  },
};

const subMenuItemStyles = {
  pl: 4,
  "&:hover": {
    backgroundColor: "#475569",
    transition: "all 0.3s ease-in-out",
    borderRadius: "8px",
  },
};

export default Sidebar;
