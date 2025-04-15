// //src/pages/Sidebar.js
// import React, { useState } from "react";
// import {
//   Drawer,
//   Box,
//   Typography,
//   Divider,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Collapse,
// } from "@mui/material";
// import {
//   ExpandLess,
//   ExpandMore,
//   Assignment,
//   Home,
//   CloudUpload,
//   CheckCircle,
//   Build,
//   Approval,
//   AddCircle,
//   MonetizationOn,  
//   ReceiptLong ,
//   RequestQuote ,
//   Description 

// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
//   const navigate = useNavigate();
//   const [activeDropdown, setActiveDropdown] = useState(null);
  
//   const toggleDropdown = (dropdown) => {
//     setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
//   };

//   const handleNavigate = (path) => {
//     navigate(path);
//     setSidebarOpen(false);
//   };

//   return (
//     <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
//       <Box
//         sx={{
//           width: 280,
//           backgroundColor: "#1E293B",
//           height: "100vh",
//           color: "#FFF",
//           display: "flex",
//           flexDirection: "column",
//           overflow: "auto",
//           "&::-webkit-scrollbar": { width: "6px" },
//           "&::-webkit-scrollbar-thumb": { backgroundColor: "#4B5563", borderRadius: "10px" },
//         }}
//       >
//         <Typography variant="h6" sx={{ fontWeight: "bold", padding: 2, textAlign: "center", letterSpacing: 1.2 }}>
//           Asset Management
//         </Typography>
//         <Divider sx={{ backgroundColor: "#FFFFFF" }} />
//         <List>
//           <ListItem button onClick={() => handleNavigate("/DashBoard")} sx={menuItemStyles}>
//             <ListItemIcon><Home sx={{ color: "#93C5FD" }} /></ListItemIcon>
//             <ListItemText primary="Home" />
//           </ListItem>
          
//           {menuSections.map((section, index) => (
//             <React.Fragment key={index}>
//               <ListItem button onClick={() => toggleDropdown(section.key)} sx={menuItemStyles}>
//                 <ListItemIcon>{section.icon}</ListItemIcon>
//                 <ListItemText primary={section.title} />
//                 {activeDropdown === section.key ? <ExpandLess /> : <ExpandMore />}
//               </ListItem>
//               <Collapse in={activeDropdown === section.key} timeout="auto" unmountOnExit>
//                 <List component="div" disablePadding>
//                   {section.items.map((item, idx) => (
//                     <ListItem key={idx} button sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
//                       <ListItemIcon sx={{ color: "#93C5FD" }}>{item.icon}</ListItemIcon>
//                       <ListItemText primary={item.text} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Collapse>
//             </React.Fragment>
//           ))}

//           {/* Directly adding the previous Bulk Operations items */}
//           <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/BulkUpload")}>
//             <ListItemIcon><CloudUpload sx={{ color: "#93C5FD" }} /></ListItemIcon>
//             <ListItemText primary="Bulk Upload" />
//           </ListItem>
//           <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/AssetDepreciation")}>
//             <ListItemIcon><MonetizationOn sx={{ color: "#93C5FD" }} /></ListItemIcon>
//             <ListItemText primary="Asset Depreciation" />
//           </ListItem>
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// const menuSections = [
//   {
//     key: "approval",
//     title: "Approval",
//     icon: <Approval sx={{ color: "#93C5FD" }} />, 
//     items: [
//       { text: "Free Pool", icon: <CheckCircle />, path: "/approval/free-pool" },
//       { text: "Assigned", icon: <Assignment />, path: "/approval/assigned" },
//       { text: "Under Maintenance", icon: <Build />, path: "/approval/under-maintenance" },
//       { text: "Purchase Order", icon: <Approval />, path: "/approval/po" },
//       { text: "Invoice", icon: <RequestQuote />, path: "/approval/invoice" }, 
//       { text: "Payment Receipt", icon: <ReceiptLong  />, path: "/approval/payment" }, 
//     ],
//   },
//   {
//     key: "newAssets",
//     title: "New Assets",
//     icon: <AddCircle sx={{ color: "#93C5FD" }} />, 
//     items: [
//       { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
//       { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
//       { text: "Upload Payment Receipt", icon: <ReceiptLong  />, path: "/new-assets/upload-reciept" },
      
//       { text: "Create New Asset", icon: <Description />, path: "/new-assets/create-new-asset" },
//     ],
//   },
// ];

// const menuItemStyles = {
//   "&:hover": {
//     backgroundColor: "#334155",
//     transition: "all 0.3s ease-in-out",
//     borderRadius: "8px",
//   },
// };

// const subMenuItemStyles = {
//   pl: 4,
//   "&:hover": {
//     backgroundColor: "#475569",
//     transition: "all 0.3s ease-in-out",
//     borderRadius: "8px",
//   },
// };

// export default Sidebar;


// src/pages/Sidebar.js
// import React, { useState } from "react";
// import {
//   Drawer,
//   Box,
//   Typography,
//   Divider,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Collapse,
//   Button,
// } from "@mui/material";
// import {
//   ExpandLess,
//   ExpandMore,
//   Assignment,
//   Home,
//   CloudUpload,
//   CheckCircle,
//   Build,
//   Approval,
//   AddCircle,
//   MonetizationOn,
//   ReceiptLong,
//   RequestQuote,
//   Description,
//   Assessment,
//   Business,
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
//   const navigate = useNavigate();
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [showReportsMenu, setShowReportsMenu] = useState(false);
//   const [showCICMenu, setShowCICMenu] = useState(false);

//   const toggleDropdown = (dropdown) => {
//     setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
//   };

//   const handleNavigate = (path) => {
//     navigate(path);
//     setSidebarOpen(false);
//   };

//   return (
//     <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
//       <Box
//         sx={{
//           width: 280,
//           backgroundColor: "#1E293B",
//           height: "100vh",
//           color: "#FFF",
//           display: "flex",
//           flexDirection: "column",
//           overflow: "auto",
//           "&::-webkit-scrollbar": { width: "6px" },
//           "&::-webkit-scrollbar-thumb": { backgroundColor: "#4B5563", borderRadius: "10px" },
//         }}
//       >
//         {/* Additional Buttons ABOVE Asset Management */}
//         <Box sx={{ p: 2 }}>
//           <Button
//             fullWidth
//             startIcon={<Assessment />}
//             onClick={() => setShowReportsMenu(!showReportsMenu)}
//             sx={{
//               justifyContent: "flex-start",
//               color: "white",
//               "&:hover": { color: "#93C5FD" },
//               textTransform: "none",
//             }}
//           >
//             Reports
//             {showReportsMenu ? <ExpandLess sx={{ ml: "auto" }} /> : <ExpandMore sx={{ ml: "auto" }} />}
//           </Button>
//           <Collapse in={showReportsMenu} timeout="auto" unmountOnExit>
//             <List component="div" disablePadding>
//               {reportsMenuItems.map((item, idx) => (
//                 <ListItem button key={idx} sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
//                   <ListItemText primary={item.text} />
//                 </ListItem>
//               ))}
//             </List>
//           </Collapse>

//           <Button
//             fullWidth
//             startIcon={<Business />}
//             onClick={() => setShowCICMenu(!showCICMenu)}
//             sx={{
//               justifyContent: "flex-start",
//               color: "white",
//               "&:hover": { color: "#93C5FD" },
//               textTransform: "none",
//               mt: 1,
//             }}
//           >
//             CIC
//             {showCICMenu ? <ExpandLess sx={{ ml: "auto" }} /> : <ExpandMore sx={{ ml: "auto" }} />}
//           </Button>
//           <Collapse in={showCICMenu} timeout="auto" unmountOnExit>
//             <List component="div" disablePadding>
//               {cicMenuItems.map((item, idx) => (
//                 <ListItem button key={idx} sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
//                   <ListItemText primary={item.text} />
//                 </ListItem>
//               ))}
//             </List>
//           </Collapse>
//         </Box>

//         {/* Main Header */}
//         <Typography variant="h6" sx={{ fontWeight: "bold", padding: 2, textAlign: "center", letterSpacing: 1.2 }}>
//           Asset Management
//         </Typography>
//         <Divider sx={{ backgroundColor: "#FFFFFF" }} />
//         <List>
//           <ListItem button onClick={() => handleNavigate("/DashBoard")} sx={menuItemStyles}>
//             <ListItemIcon><Home sx={{ color: "#93C5FD" }} /></ListItemIcon>
//             <ListItemText primary="Home" />
//           </ListItem>

//           {menuSections.map((section, index) => (
//             <React.Fragment key={index}>
//               <ListItem button onClick={() => toggleDropdown(section.key)} sx={menuItemStyles}>
//                 <ListItemIcon>{section.icon}</ListItemIcon>
//                 <ListItemText primary={section.title} />
//                 {activeDropdown === section.key ? <ExpandLess /> : <ExpandMore />}
//               </ListItem>
//               <Collapse in={activeDropdown === section.key} timeout="auto" unmountOnExit>
//                 <List component="div" disablePadding>
//                   {section.items.map((item, idx) => (
//                     <ListItem key={idx} button sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
//                       <ListItemIcon sx={{ color: "#93C5FD" }}>{item.icon}</ListItemIcon>
//                       <ListItemText primary={item.text} />
//                     </ListItem>
//                   ))}
//                 </List>
//               </Collapse>
//             </React.Fragment>
//           ))}

//           <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/BulkUpload")}>
//             <ListItemIcon><CloudUpload sx={{ color: "#93C5FD" }} /></ListItemIcon>
//             <ListItemText primary="Bulk Upload" />
//           </ListItem>
//           <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/AssetDepreciation")}>
//             <ListItemIcon><MonetizationOn sx={{ color: "#93C5FD" }} /></ListItemIcon>
//             <ListItemText primary="Asset Depreciation" />
//           </ListItem>
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// // Menu for reports
// const reportsMenuItems = [
//   { text: "Borrower Master Report", path: "/components/BorrowMasterReport" },
//   { text: "Credit Report", path: "/components/CreditReport" },
//   { text: "Death Report", path: "/components/DeathReport" },
//   { text: "Employee Master Report", path: "/components/EmployeeMasterReport" },
//   { text: "Loan Application Report", path: "/components/LoanApplicationReport" },
//   { text: "Fore-Clouser Report", path: "/components/ForeClouserReport" },
//   { text: "Loan Details Report", path: "/components/LoanDetailsReport" },
//   { text: "LUC Report", path: "/components/LUCReport" },
// ];

// // CIC sub-menu
// const cicMenuItems = [
//   { text: "Reports", path: "/components/Reports" },
//   { text: "Reupload", path: "/components/Reupload" },
// ];

// const menuSections = [
//   {
//     key: "approval",
//     title: "Approval",
//     icon: <Approval sx={{ color: "#93C5FD" }} />,
//     items: [
//       { text: "Free Pool", icon: <CheckCircle />, path: "/approval/free-pool" },
//       { text: "Assigned", icon: <Assignment />, path: "/approval/assigned" },
//       { text: "Under Maintenance", icon: <Build />, path: "/approval/under-maintenance" },
//       { text: "Purchase Order", icon: <Approval />, path: "/approval/po" },
//       { text: "Invoice", icon: <RequestQuote />, path: "/approval/invoice" },
//       { text: "Payment Receipt", icon: <ReceiptLong />, path: "/approval/payment" },
//     ],
//   },
//   {
//     key: "newAssets",
//     title: "New Assets",
//     icon: <AddCircle sx={{ color: "#93C5FD" }} />,
//     items: [
//       { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
//       { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
//       { text: "Upload Payment Receipt", icon: <ReceiptLong />, path: "/new-assets/upload-reciept" },
//       { text: "Create New Asset", icon: <Description />, path: "/new-assets/create-new-asset" },
//     ],
//   },
// ];

// const menuItemStyles = {
//   "&:hover": {
//     backgroundColor: "#334155",
//     transition: "all 0.3s ease-in-out",
//     borderRadius: "8px",
//   },
// };

// const subMenuItemStyles = {
//   pl: 4,
//   "&:hover": {
//     backgroundColor: "#475569",
//     transition: "all 0.3s ease-in-out",
//     borderRadius: "8px",
//   },
// };

// export default Sidebar;


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
  Button,
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
  Description,
  Assessment,
  Business,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
  const [showCICMenu, setShowCICMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);

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
        <Box sx={{ p: 2, mt: 10 }}>
          <Button
            fullWidth
            startIcon={<Assessment />}
            onClick={() => setShowReportsMenu(!showReportsMenu)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { color: "#93C5FD" },
              textTransform: "none",
            }}
          >
            Reports
            {showReportsMenu ? <ExpandLess sx={{ ml: "auto" }} /> : <ExpandMore sx={{ ml: "auto" }} />}
          </Button>
          <Collapse in={showReportsMenu} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {reportsMenuItems.map((item, idx) => (
                <ListItem button key={idx} sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>

          <Button
            fullWidth
            startIcon={<Business />}
            onClick={() => setShowCICMenu(!showCICMenu)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { color: "#93C5FD" },
              textTransform: "none",
              mt: 1,
            }}
          >
            CIC
            {showCICMenu ? <ExpandLess sx={{ ml: "auto" }} /> : <ExpandMore sx={{ ml: "auto" }} />}
          </Button>
          <Collapse in={showCICMenu} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {cicMenuItems.map((item, idx) => (
                <ListItem button key={idx} sx={subMenuItemStyles} onClick={() => handleNavigate(item.path)}>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>
          </Collapse>

          <Button
            fullWidth
            startIcon={<Assessment />}
            onClick={() => setShowAssetMenu(!showAssetMenu)}
            sx={{
              justifyContent: "flex-start",
              color: "white",
              "&:hover": { color: "#93C5FD" },
              textTransform: "none",
              mt: 1,
            }}
          >
            Asset Management
            {showAssetMenu ? <ExpandLess sx={{ ml: "auto" }} /> : <ExpandMore sx={{ ml: "auto" }} />}
          </Button>
          <Collapse in={showAssetMenu} timeout="auto" unmountOnExit>
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

              <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/BulkUpload")}>
                <ListItemIcon><CloudUpload sx={{ color: "#93C5FD" }} /></ListItemIcon>
                <ListItemText primary="Bulk Upload" />
              </ListItem>
              <ListItem button sx={menuItemStyles} onClick={() => handleNavigate("/AssetDepreciation")}>
                <ListItemIcon><MonetizationOn sx={{ color: "#93C5FD" }} /></ListItemIcon>
                <ListItemText primary="Asset Depreciation" />
              </ListItem>
            </List>
          </Collapse>
        </Box>
      </Box>
    </Drawer>
  );
};

// Menu for reports
const reportsMenuItems = [
  { text: "Borrower Master Report", path: "/components/BorrowMasterReport" },
  { text: "Credit Report", path: "/components/CreditReport" },
  { text: "Death Report", path: "/components/DeathReport" },
  { text: "Employee Master Report", path: "/components/EmployeeMasterReport" },
  { text: "Loan Application Report", path: "/components/LoanApplicationReport" },
  { text: "Fore-Clouser Report", path: "/components/ForeClouserReport" },
  { text: "Loan Details Report", path: "/components/LoanDetailsReport" },
  { text: "LUC Report", path: "/components/LUCReport" },
];

// CIC sub-menu
const cicMenuItems = [
  { text: "Reports", path: "/components/Reports" },
  { text: "Reupload", path: "/components/Reupload" },
];

// Asset management menu
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
      { text: "Payment Receipt", icon: <ReceiptLong />, path: "/approval/payment" },
    ],
  },
  {
    key: "newAssets",
    title: "New Assets",
    icon: <AddCircle sx={{ color: "#93C5FD" }} />,
    items: [
      { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
      { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
      { text: "Upload Payment Receipt", icon: <ReceiptLong />, path: "/new-assets/upload-reciept" },
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
