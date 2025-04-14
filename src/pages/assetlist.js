//src/pages/assetlist.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Ensure correct path
import axios from "axios";
import * as XLSX from "xlsx";
import { Search, IosShare  } from "@mui/icons-material";
import { InfoOutlined } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  TextField,
  IconButton,
} from "@mui/material";

const AssetList = () => {
  const { category, type } = useParams(); // Extract parameters from URL
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]); // For search functionality
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Search state
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/assetlist/details/${category}/${type}`)
      .then((response) => {
        setAssets(response.data);
        setFilteredAssets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching asset details:", error);
        setError("Failed to load assets.");
        setLoading(false);
      });
  }, [category, type]);

  const handleAction = (assetId, action) => {
    console.log(`Performing action: ${action} on Asset ID: ${assetId}`);
    if (action === "Assign") {
      navigate(`/assign-asset/${assetId}`);
    } else if (action === "Free Pool") {
      navigate(`/free-asset/${assetId}`);
    } else if (action === "Maintenance") {
      navigate(`/undermaintenance-asset/${assetId}`);
    }
  };

  // Function to handle search filtering
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = assets.filter(({ asset_id, brand, model, imei_num, assignment_status, assigned_to }) =>
      [asset_id, brand, model, imei_num, assignment_status, assigned_to]
        .some((field) => field?.toString().toLowerCase().includes(query))
    );
    setFilteredAssets(filtered);
  };

  // Function to export data as Excel file
  const exportToExcel = () => {
    // Format data before export
    const formattedData = filteredAssets.map((asset) => ({
      "Asset ID": asset.asset_id,
      "Name": `${asset.brand} - ${asset.model}`,
      "IMEI Number": asset.imei_num,
      "Status": asset.assignment_status,
      "Emp ID": asset.assigned_to?.emp_id || "N/A",
      "Employee Name": asset.assigned_to?.emp_name || "N/A",
      "Designation": asset.assigned_to?.designation_name || "N/A",
      "Department": asset.assigned_to?.department_name || "N/A",
      "Branch": asset.assigned_to?.branchid_name || "N/A",
      "Area": asset.assigned_to?.areaid_name || "N/A",
      "Region": asset.assigned_to?.regionid_name || "N/A",
      "Cluster": asset.assigned_to?.clusterid_name || "N/A",
      "State": asset.assigned_to?.state || "N/A",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");
    XLSX.writeFile(workbook, `Asset_List_${category}_${type}.xlsx`);
  };
  

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center" mt={3}>
        {error}
      </Typography>
    );

  const showActions = ["assigned", "free-pool", "maintenance"].includes(category);

  return (
    <>
      <Navbar />
      <Box sx={{ padding: 4 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: "bold",
          textTransform: "capitalize",
          color: "#1976D2",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {category.replace("-", " ")} - {type}

        {/* Search & Export Buttons (Side by Side) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Search Bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#FFFFFF",
              borderRadius: "30px",
              padding: "6px 12px",
              boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.15)",
              width: "350px",
              border: "1px solid #ccc",
            }}
          >
            <Search sx={{ color: "#757575", marginRight: "8px" }} />
            <TextField
              placeholder="Search assets..."
              variant="standard"
              InputProps={{ disableUnderline: true }}
              value={searchQuery}
              onChange={handleSearch}
              sx={{ flex: 1 }}
            />
          </Box>

          {/* Export Button (Next to Search Bar) */}
          <IconButton sx={{ color: "#1976D2" }} onClick={exportToExcel}>
            <IosShare />
          </IconButton>
        </Box>
      </Typography>

        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F4F6F8" }}>
              {["Asset ID", "Name", "IMEI Number", "Status", "Assigned To", ...(showActions ? ["Actions"] : [])].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: "bold", color: "#37474F" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssets.map(({ asset_id, brand, model, imei_num, assignment_status, assigned_to }) => (
                <TableRow key={asset_id} hover>
                  <TableCell>{asset_id}</TableCell>
                  <TableCell>{`${brand} - ${model}`}</TableCell>
                  <TableCell>{imei_num}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        padding: "4px 10px",
                        borderRadius: 1,
                        display: "inline-block",
                        fontSize: "0.85rem",
                        backgroundColor:
                        assignment_status === "Assigned"
                          ? "#D1E8FF" // Light blue
                          : assignment_status === "Under Maintenance"
                          ? "#FFF3CD" // Light orange
                          : assignment_status === "In Progress"
                          ? "#FFE082" // Soft Amber (Better contrast)
                          : "#E8F5E9", // Light green
                      
                      color:
                        assignment_status === "Assigned"
                          ? "#1976D2" // Deep blue
                          : assignment_status === "Under Maintenance"
                          ? "#FF9800" // Orange
                          : assignment_status === "In Progress"
                          ? "#795548" // Brown (Better contrast on yellow)
                          : "#388E3C", // Dark green
                      
                      }}
                    >
                      {assignment_status}
                    </Typography>
                  </TableCell>
                  {/* <TableCell>{assigned_to || "N/A"}</TableCell> */}
                  <TableCell>
                    {assigned_to ? (
                      <>
                        {assigned_to.emp_id} - {assigned_to.emp_name}
                        <Tooltip
                          title={
                            <div style={{ textAlign: "left", fontSize: "0.85rem", lineHeight: "1.5" }}>
                              <strong>Emp ID:</strong> {assigned_to.emp_id} <br />
                              <strong>Name:</strong> {assigned_to.emp_name} <br />
                              <strong>Designation:</strong> {assigned_to.designation_name} <br />
                              <strong>Department:</strong> {assigned_to.department_name} <br />
                              <strong>Branch:</strong> {assigned_to.branchid_name} <br />
                              <strong>Area:</strong> {assigned_to.areaid_name} <br />
                              <strong>Region:</strong> {assigned_to.regionid_name} <br />
                              <strong>Cluster:</strong> {assigned_to.clusterid_name} <br />
                              <strong>State:</strong> {assigned_to.state} <br />
                            </div>
                          }
                          arrow
                        >
                          <IconButton size="small" sx={{ color: "#1976D2", ml: 1 }}>
                            <InfoOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      "Unassigned"
                    )}
                  </TableCell>
                  {showActions && (

                  <TableCell>
                    {category === "assigned" && (
                      <Button 
                        variant="contained"
                        sx={{ backgroundColor: "#388E3C", color: "white", "&:hover": { backgroundColor: "#1B5E20" }, mr: 1 }}
                        onClick={() => handleAction(asset_id, "Free Pool")}
                        disabled={assignment_status === "In Progress"} 

                      >
                        Free Pool
                      </Button>                      
                    )}
                    {category === "free-pool" && (
                      <Box display="flex" gap={2}>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#1976D2",
                            color: "white",
                            "&:hover": { backgroundColor: "#0D47A1" }
                          }}
                          onClick={() => handleAction(asset_id, "Assign")}
                          disabled={assignment_status === "In Progress"} // Disable when status is "In Progress"
                        >
                          Assign
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: "#FF9800",
                            color: "white",
                            "&:hover": { backgroundColor: "#E65100" }
                          }}
                          onClick={() => handleAction(asset_id, "Maintenance")}
                          disabled={assignment_status === "In Progress"} // Disable when status is "In Progress"
                        >
                          Maintenance
                        </Button>
                      </Box>
                    )}

                    {category === "maintenance" && (
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "#388E3C", color: "white", "&:hover": { backgroundColor: "#1B5E20" } }}
                        onClick={() => handleAction(asset_id, "Free Pool")}
                        disabled={assignment_status === "In Progress"} // Disable when status is "In Progress"
                      >
                        Free Pool
                      </Button>
                    )}

                    
                  </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default AssetList;