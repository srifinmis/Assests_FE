// // src/pages/Sidebar.js
// import React, { useState, useMemo } from "react";
// import {
//   Drawer,
//   Box,
//   Divider,
//   List,
//   ListItemIcon,
//   ListItemText,
//   Collapse,
//   ListItemButton,
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
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import GroupIcon from "@mui/icons-material/Group";
// import SrifinLogo from "../assets/srifin_final.svg";
// import EditIcon from '@mui/icons-material/Edit';

// const MODULES = {
//   HOME: "IT-HOME",
//   APPROVAL: "IT-APPROVAL",
//   NEW_ASSETS: "IT-NEW ASSETS",
//   BULK_UPLOAD: "IT-Bulk Upload",
//   ASSET_DEPRECIATION: "IT-Asset Depreciation",
//   USER_ROLES: "IT-User Roles",
//   HO_USER: "IT-HO_User"
// };

// const Sidebar = ({ sidebarOpen, setSidebarOpen, allowedModules = [] }) => {
//   const navigate = useNavigate();
//   const [activeDropdown, setActiveDropdown] = useState(null);

//   const toggleDropdown = (dropdown) => {
//     setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
//   };

//   const handleNavigate = (path) => {
//     navigate(path);
//     setSidebarOpen(false);
//   };

//   const isModuleAllowed = (moduleName) => allowedModules.includes(moduleName);

//   // Memoized menu items to avoid re-creation on every render
//   const approvalMenuItems = useMemo(() => [
//     { text: "Free Pool", icon: <CheckCircle />, path: "/approval/free-pool" },
//     { text: "Assigned", icon: <Assignment />, path: "/approval/assigned" },
//     { text: "Under Maintenance", icon: <Build />, path: "/approval/under-maintenance" },
//     { text: "Purchase Order", icon: <Approval />, path: "/approval/po" },
//     { text: "Invoice", icon: <RequestQuote />, path: "/approval/invoice" },
//     { text: "Payment Receipt", icon: <ReceiptLong />, path: "/approval/payment" },
//     { text: "Bulk Upload", icon: <CloudUpload />, path: "/approval/bulk" },
//   ], []);

//   const newAssetsMenuItems = useMemo(() => [
//     { text: "Purchase Order", icon: <AddCircle />, path: "/new-assets/purchase-order" },
//     { text: "Invoice Main", icon: <AddCircle />, path: "/new-assets/invoice" },
//     // { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
//     // { text: "Edit PO", icon: <EditIcon />, path: "/new-assets/edit-po" },
//     // { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
//     { text: "Upload Payment Receipt", icon: <ReceiptLong />, path: "/new-assets/upload-reciept" },
//   ], []);

//   return (
//     <Drawer
//       anchor="left"
//       open={sidebarOpen}
//       onClose={() => setSidebarOpen(false)}
//       ModalProps={{ keepMounted: true }} // Improves performance on mobile
//     >
//       <Box
//         sx={{
//           width: 280,
//           bgcolor: "#1E293B",
//           height: "100vh",
//           color: "#FFF",
//           display: "flex",
//           flexDirection: "column",
//           overflowY: "auto",
//           "&::-webkit-scrollbar": { width: "6px" },
//           "&::-webkit-scrollbar-thumb": { bgcolor: "#4B5563", borderRadius: 1.25 },
//           p: 2,
//         }}
//       >
//         <Box
//           component="img"
//           src={SrifinLogo}
//           alt="Srifin Logo"
//           sx={{
//             width: 160,
//             height: 40,
//             bgcolor: "white",
//             p: "5px 0",
//             borderRadius: 1,
//             mb: 1,
//             alignSelf: "center",
//             objectFit: "contain",
//           }}
//         />
//         <Divider sx={{ bgcolor: "#FFFFFF", mb: 2 }} />
//         <List component="nav" aria-label="main navigation">
//           {isModuleAllowed(MODULES.HOME) && (
//             <ListItemButton
//               onClick={() => handleNavigate("/DashBoard")}
//               sx={menuItemStyles}
//               aria-label="Navigate to Home"
//             >
//               <ListItemIcon>
//                 <Home sx={{ color: "#93C5FD" }} />
//               </ListItemIcon>
//               <ListItemText primary="Home" />
//             </ListItemButton>
//           )}

//           {isModuleAllowed(MODULES.APPROVAL) && (
//             <>
//               <ListItemButton
//                 onClick={() => toggleDropdown("approval")}
//                 sx={menuItemStyles}
//                 aria-controls="approval-menu"
//                 aria-expanded={activeDropdown === "approval"}
//                 aria-haspopup="true"
//               >
//                 <ListItemIcon>
//                   <Approval sx={{ color: "#93C5FD" }} />
//                 </ListItemIcon>
//                 <ListItemText primary="Approval" />
//                 {activeDropdown === "approval" ? <ExpandLess /> : <ExpandMore />}
//               </ListItemButton>
//               <Collapse
//                 in={activeDropdown === "approval"}
//                 timeout="auto"
//                 unmountOnExit
//                 id="approval-menu"
//               >
//                 <List component="div" disablePadding>
//                   {approvalMenuItems.map(({ text, icon, path }, idx) => (
//                     <ListItemButton
//                       key={idx}
//                       sx={subMenuItemStyles}
//                       onClick={() => handleNavigate(path)}
//                       aria-label={`Navigate to ${text}`}
//                     >
//                       <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
//                       <ListItemText primary={text} />
//                     </ListItemButton>
//                   ))}
//                 </List>
//               </Collapse>
//             </>
//           )}

//           {isModuleAllowed(MODULES.NEW_ASSETS) && (
//             <>
//               <ListItemButton
//                 onClick={() => toggleDropdown("newAssets")}
//                 sx={menuItemStyles}
//                 aria-controls="new-assets-menu"
//                 aria-expanded={activeDropdown === "newAssets"}
//                 aria-haspopup="true"
//               >
//                 <ListItemIcon>
//                   <AddCircle sx={{ color: "#93C5FD" }} />
//                 </ListItemIcon>
//                 <ListItemText primary="New Assets" />
//                 {activeDropdown === "newAssets" ? <ExpandLess /> : <ExpandMore />}
//               </ListItemButton>
//               <Collapse
//                 in={activeDropdown === "newAssets"}
//                 timeout="auto"
//                 unmountOnExit
//                 id="new-assets-menu"
//               >
//                 <List component="div" disablePadding>
//                   {newAssetsMenuItems.map(({ text, icon, path }, idx) => (
//                     <ListItemButton
//                       key={idx}
//                       sx={subMenuItemStyles}
//                       onClick={() => handleNavigate(path)}
//                       aria-label={`Navigate to ${text}`}
//                     >
//                       <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
//                       <ListItemText primary={text} />
//                     </ListItemButton>
//                   ))}
//                 </List>
//               </Collapse>
//             </>
//           )}

//           {isModuleAllowed(MODULES.BULK_UPLOAD) && (
//             <ListItemButton
//               sx={menuItemStyles}
//               onClick={() => handleNavigate("/BulkUpload")}
//               aria-label="Navigate to Bulk Upload"
//             >
//               <ListItemIcon>
//                 <CloudUpload sx={{ color: "#93C5FD" }} />
//               </ListItemIcon>
//               <ListItemText primary="Bulk Upload" />
//             </ListItemButton>
//           )}

//           {isModuleAllowed(MODULES.ASSET_DEPRECIATION) && (
//             <ListItemButton
//               sx={menuItemStyles}
//               onClick={() => handleNavigate("/new-assets/assetdepreciation")}
//               aria-label="Navigate to Asset Depreciation"
//             >
//               <ListItemIcon>
//                 <MonetizationOn sx={{ color: "#93C5FD" }} />
//               </ListItemIcon>
//               <ListItemText primary="Asset Depreciation" />
//             </ListItemButton>
//           )}

//           {isModuleAllowed(MODULES.USER_ROLES) && (
//             <ListItemButton
//               sx={menuItemStyles}
//               onClick={() => handleNavigate("/user_roles")}
//               aria-label="Navigate to User Roles"
//             >
//               <ListItemIcon>
//                 <GroupIcon sx={{ color: "#93C5FD" }} />
//               </ListItemIcon>
//               <ListItemText primary="User Roles" />
//             </ListItemButton>
//           )}
//         </List>
//       </Box>
//     </Drawer>
//   );
// };

// const menuItemStyles = {
//   "&:hover": {
//     bgcolor: "#334155",
//     transition: "background-color 0.3s ease-in-out",
//     borderRadius: 1,
//   },
// };

// const subMenuItemStyles = {
//   pl: 4,
//   "&:hover": {
//     bgcolor: "#475569",
//     transition: "background-color 0.3s ease-in-out",
//     borderRadius: 1,
//   },
// };

// export default Sidebar;





import React, { useState, useMemo } from "react";
import {
  Drawer,
  Box,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Collapse,
  ListItemButton,
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
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import GroupIcon from "@mui/icons-material/Group";
import SrifinLogo from "../assets/srifin_final.svg";
import EditIcon from '@mui/icons-material/Edit';

const MODULES = {
  HOME: "IT-HOME",
  APPROVAL: "IT-APPROVAL",
  NEW_ASSETS: "IT-NEW ASSETS",
  BULK_UPLOAD: "IT-Bulk Upload",
  ASSET_DEPRECIATION: "IT-Asset Depreciation",
  USER_ROLES: "IT-User Roles",
  HO_USER: "IT-HO_User",
  RO_USER: "IT-RO_User",
  BO_USER: "IT-BO_User",
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

  const approvalMenuItems = useMemo(() => [
    { text: "Free Pool", icon: <CheckCircle />, path: "/approval/free-pool" },
    { text: "Assigned", icon: <Assignment />, path: "/approval/assigned" },
    { text: "Under Maintenance", icon: <Build />, path: "/approval/under-maintenance" },
    { text: "Purchase Order", icon: <Approval />, path: "/approval/po" },
    { text: "Invoice", icon: <RequestQuote />, path: "/approval/invoice" },
    { text: "Payment Receipt", icon: <ReceiptLong />, path: "/approval/payment" },
    { text: "Bulk Upload", icon: <CloudUpload />, path: "/approval/bulk" },
  ], []);

  const newAssetsMenuItems = useMemo(() => [
    { text: "Create PO", icon: <AddCircle />, path: "/new-assets/create-po" },
    { text: "Edit PO", icon: <EditIcon />, path: "/new-assets/edit-po" },
    { text: "Upload Invoice", icon: <RequestQuote />, path: "/new-assets/upload-invoice" },
    { text: "Upload Payment Receipt", icon: <ReceiptLong />, path: "/new-assets/upload-reciept" },
  ], []);

  const hoUserMenuItems = useMemo(() => [
    { text: "Report", icon: <EditIcon />, path: "/ho-user/roreport" },
    { text: "Assign", icon: <CloudUpload />, path: "/ho-user/credit_bulk-upload" },
    // { text: "RO Unassign", icon: <EditIcon />, path: "/ho-user/rounassign" },
    // { text: "BO", icon: <RequestQuote />, path: "/ho-user/bo" },
    // { text: "Customer", icon: <ReceiptLong />, path: "/ho-user/customer" },
  ], []);

  const roUserMenuItems = useMemo(() => [
    { text: "Report", icon: <Assignment />, path: "/ro-user/roreport" },
    { text: "Accept", icon: <EditIcon />, path: "/ho-user/ropage" },
    { text: "Assign", icon: <ReceiptLong />, path: "/ho-user/roassign" },
  ], []);

  const boUserMenuItems = useMemo(() => [
    { text: "Report", icon: <Assignment />, path: "/bo-user/boreport" },
    { text: "Accept", icon: <RequestQuote />, path: "/bo-user/bopage" },
    { text: "Assign", icon: <ReceiptLong />, path: "/bo-user/boassign" },
  ], []);

  return (
    <Drawer
      anchor="left"
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      ModalProps={{ keepMounted: true }} // Improves performance on mobile
    >
      <Box
        sx={{
          width: 280,
          bgcolor: "#1E293B",
          height: "100vh",
          color: "#FFF",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "#4B5563", borderRadius: 1.25 },
          p: 2,
        }}
      >
        <Box
          component="img"
          src={SrifinLogo}
          alt="Srifin Logo"
          sx={{
            width: 160,
            height: 40,
            bgcolor: "white",
            p: "5px 0",
            borderRadius: 1,
            mb: 1,
            alignSelf: "center",
            objectFit: "contain",
          }}
        />
        <Divider sx={{ bgcolor: "#FFFFFF", mb: 2 }} />
        <List component="nav" aria-label="main navigation">
          {isModuleAllowed(MODULES.HOME) && (
            <ListItemButton
              onClick={() => handleNavigate("/DashBoard")}
              sx={menuItemStyles}
              aria-label="Navigate to Home"
            >
              <ListItemIcon>
                <Home sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          )}

          {isModuleAllowed(MODULES.APPROVAL) && (
            <>
              <ListItemButton
                onClick={() => toggleDropdown("approval")}
                sx={menuItemStyles}
                aria-controls="approval-menu"
                aria-expanded={activeDropdown === "approval"}
                aria-haspopup="true"
              >
                <ListItemIcon>
                  <Approval sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="Approval" />
                {activeDropdown === "approval" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse
                in={activeDropdown === "approval"}
                timeout="auto"
                unmountOnExit
                id="approval-menu"
              >
                <List component="div" disablePadding>
                  {approvalMenuItems.map(({ text, icon, path }, idx) => (
                    <ListItemButton
                      key={idx}
                      sx={subMenuItemStyles}
                      onClick={() => handleNavigate(path)}
                      aria-label={`Navigate to ${text}`}
                    >
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {isModuleAllowed(MODULES.NEW_ASSETS) && (
            <>
              <ListItemButton
                onClick={() => toggleDropdown("newAssets")}
                sx={menuItemStyles}
                aria-controls="new-assets-menu"
                aria-expanded={activeDropdown === "newAssets"}
                aria-haspopup="true"
              >
                <ListItemIcon>
                  <AddCircle sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="New Assets" />
                {activeDropdown === "newAssets" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse
                in={activeDropdown === "newAssets"}
                timeout="auto"
                unmountOnExit
                id="new-assets-menu"
              >
                <List component="div" disablePadding>
                  {newAssetsMenuItems.map(({ text, icon, path }, idx) => (
                    <ListItemButton
                      key={idx}
                      sx={subMenuItemStyles}
                      onClick={() => handleNavigate(path)}
                      aria-label={`Navigate to ${text}`}
                    >
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {isModuleAllowed(MODULES.BULK_UPLOAD) && (
            <ListItemButton
              sx={menuItemStyles}
              onClick={() => handleNavigate("/BulkUpload")}
              aria-label="Navigate to Bulk Upload"
            >
              <ListItemIcon>
                <CloudUpload sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="Bulk Upload" />
            </ListItemButton>
          )}

          {isModuleAllowed(MODULES.ASSET_DEPRECIATION) && (
            <ListItemButton
              sx={menuItemStyles}
              onClick={() => handleNavigate("/new-assets/assetdepreciation")}
              aria-label="Navigate to Asset Depreciation"
            >
              <ListItemIcon>
                <MonetizationOn sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="Asset Depreciation" />
            </ListItemButton>
          )}

          {isModuleAllowed(MODULES.USER_ROLES) && (
            <ListItemButton
              sx={menuItemStyles}
              onClick={() => handleNavigate("/user_roles")}
              aria-label="Navigate to User Roles"
            >
              <ListItemIcon>
                <GroupIcon sx={{ color: "#93C5FD" }} />
              </ListItemIcon>
              <ListItemText primary="User Roles" />
            </ListItemButton>
          )}

          {isModuleAllowed(MODULES.HO_USER) && (
            <>
              <ListItemButton
                onClick={() => toggleDropdown("hoUser")}
                sx={menuItemStyles}
                aria-controls="ho-user-menu"
                aria-expanded={activeDropdown === "hoUser"}
                aria-haspopup="true"
              >
                <ListItemIcon>
                  <CorporateFareIcon sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="MENU" />
                {activeDropdown === "hoUser" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse
                in={activeDropdown === "hoUser"}
                timeout="auto"
                unmountOnExit
                id="ho-user-menu"
              >
                <List component="div" disablePadding>
                  {hoUserMenuItems.map(({ text, icon, path }, idx) => (
                    <ListItemButton
                      key={idx}
                      sx={subMenuItemStyles}
                      onClick={() => handleNavigate(path)}
                      aria-label={`Navigate to ${text}`}
                    >
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </>
          )}
          {isModuleAllowed(MODULES.BO_USER) && (
            <>
              <ListItemButton
                onClick={() => toggleDropdown("boUser")}
                sx={menuItemStyles}
                aria-controls="bo-user-menu"
                aria-expanded={activeDropdown === "boUser"}
                aria-haspopup="true"
              >
                <ListItemIcon>
                  <AddCircle sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="MENU" />
                {activeDropdown === "boUser" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse
                in={activeDropdown === "boUser"}
                timeout="auto"
                unmountOnExit
                id="bo-user-menu"
              >
                <List component="div" disablePadding>
                  {boUserMenuItems.map(({ text, icon, path }, idx) => (
                    <ListItemButton
                      key={idx}
                      sx={subMenuItemStyles}
                      onClick={() => handleNavigate(path)}
                      aria-label={`Navigate to ${text}`}
                    >
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </>
          )}
          {isModuleAllowed(MODULES.RO_USER) && (
            <>
              <ListItemButton
                onClick={() => toggleDropdown("roUser")}
                sx={menuItemStyles}
                aria-controls="ro-user-menu"
                aria-expanded={activeDropdown === "roUser"}
                aria-haspopup="true"
              >
                <ListItemIcon>
                  <AddCircle sx={{ color: "#93C5FD" }} />
                </ListItemIcon>
                <ListItemText primary="MENU" />
                {activeDropdown === "roUser" ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse
                in={activeDropdown === "roUser"}
                timeout="auto"
                unmountOnExit
                id="ro-user-menu"
              >
                <List component="div" disablePadding>
                  {roUserMenuItems.map(({ text, icon, path }, idx) => (
                    <ListItemButton
                      key={idx}
                      sx={subMenuItemStyles}
                      onClick={() => handleNavigate(path)}
                      aria-label={`Navigate to ${text}`}
                    >
                      <ListItemIcon sx={{ color: "#93C5FD" }}>{icon}</ListItemIcon>
                      <ListItemText primary={text} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

const menuItemStyles = {
  "&:hover": {
    bgcolor: "#334155",
    transition: "background-color 0.3s ease-in-out",
    borderRadius: 1,
  },
};

const subMenuItemStyles = {
  pl: 4,
  "&:hover": {
    bgcolor: "#475569",
    transition: "background-color 0.3s ease-in-out",
    borderRadius: 1,
  },
};

export default Sidebar;