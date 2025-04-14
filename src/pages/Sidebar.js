//src/pages/Sidebar.js
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
  ReceiptLong ,
  RequestQuote ,
  Description 

} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

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
          <ListItem button onClick={() => handleNavigate("/DashBoard")} sx={menuItemStyles}>
            <ListItemIcon><Home sx={{ color: "#93C5FD" }} /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          
          {menuSections.map((section, index) => (
            <React.Fragment key={index}>
              <ListItem button onClick={() => toggleDropdown(section.key)} sx={menuItemStyles}>
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.title} />
                {activeDropdown === section.key ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={activeDropdown === section.key} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map((item, idx) => (
                    <ListItem key={idx} button sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}

          {/* Directly adding the previous Bulk Operations items */}
          <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/BulkUpload")}>
            <ListItemIcon><CloudUpload sx={{ color: "#93C5FD" }} /></ListItemIcon>
            <ListItemText primary="Bulk Upload" />
          </ListItem>
          <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/AssetDepreciation")}>
            <ListItemIcon><MonetizationOn sx={{ color: "#93C5FD" }} /></ListItemIcon>
            <ListItemText primary="Asset Depreciation" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

const menuSections = [
  {
    key: "approval",
    title: "Approval",
    icon: <Approval sx={{ color: "#93C5FD" }} />, 
    items: [
      { text: "Free Pool", icon: <CheckCircle />, path: "/approval/free-pool" },
      { text: "Assigned", icon: <Assignment />, path: "/approval/assigned" },
      { text: "Under Maintenance", icon: <Build />, path: "/approval/under-maintenance" },
      { text: "Purchase Order", icon: <Approval />, path: "/approval/po" },
      { text: "Invoice", icon: <RequestQuote />, path: "/approval/invoice" }, 
      { text: "Payment Receipt", icon: <ReceiptLong  />, path: "/approval/payment" }, 
    ],
  },
  {
    key: "newAssets",
    title: "New Assets",
    icon: <AddCircle sx={{ color: "#93C5FD" }} />, 
    items: [
      { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
      { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
      { text: "Upload Payment Receipt", icon: <ReceiptLong  />, path: "/new-assets/upload-reciept" },
      
      { text: "Create New Asset", icon: <Description />, path: "/new-assets/create-new-asset" },
    ],
  },
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