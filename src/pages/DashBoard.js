import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Modal, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const DashBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAsset] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if the page is Total Assets
  const isTotalAssetsPage = location.pathname.includes("/total-assets");

  const { API_CONFIG, REFRESH_CONFIG } = require('../configuration');

  useEffect(() => {
    const rawStates = localStorage.getItem("statesAssigned");
    let statesAssigned = [];
  
    try {
      const parsed = JSON.parse(rawStates);
      // Ensure it's always an array
      if (Array.isArray(parsed)) {
        statesAssigned = parsed;
      } else if (typeof parsed === "string") {
        statesAssigned = [parsed]; // Convert single string to array
      }
    } catch (err) {
      console.error("Invalid statesAssigned in localStorage:", rawStates);
    }
  
    axios
      .get(`${API_CONFIG.APIURL}/dashboard/summary`, {
        headers: {
          statesAssigned: statesAssigned.join(","), // Safe to call join now
        },
      })
      .then((response) => {
        setAssets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching asset data:", error);
        setError("Failed to load assets");
        setLoading(false);
      });
  }, []);  
  
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F8F9FA", display: "flex", flexDirection: "column" }}>
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Dashboard Content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 4 }, mt: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography variant="h6" color="error" textAlign="center">
            {error}
          </Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {assets.map((asset, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card
                  sx={{
                    backgroundColor: "#ECF0F1",
                    color: "#1C2833",
                    borderRadius: 3,
                    p: 2,
                    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    "&:hover": {
                      transform: "scale(1.05)",
                      backgroundColor: "#D5DBDB",
                      boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}>
                      {asset.name}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {/* Hide Assigned & Maintenance in Total Assets Page */}
                      {!isTotalAssetsPage && (
                        <Box sx={{ textAlign: "center", flex: 1 }}>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: "bold",
                              color: "#2ECC71",
                              cursor: "pointer",
                              transition: "transform 0.2s ease-in-out",
                              "&:hover": { transform: "scale(1.2)" },
                            }}
                            onClick={() => navigate(`/assigned/${asset.name.toLowerCase()}`)}
                          >
                            {asset.assigned}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#27AE60" }}>Assigned</Typography>

                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: "bold",
                              color: "#E74C3C",
                              cursor: "pointer",
                              transition: "transform 0.2s ease-in-out",
                              mt: 1,
                              "&:hover": { transform: "scale(1.2)" },
                            }}
                            onClick={() => navigate(`/maintenance/${asset.name.toLowerCase()}`)}
                          >
                            {asset.underMaintenance}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#C0392B", fontSize: "12px" }}>Under Maintenance</Typography>
                        </Box>
                      )}

                      {/* Free Pool & Total */}
                      <Box sx={{ textAlign: "center", flex: 1 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                            color: "#2980B9",
                            cursor: "pointer",
                            transition: "transform 0.2s ease-in-out",
                            "&:hover": { transform: "scale(1.2)" },
                          }}
                          onClick={() => navigate(`/free-pool/${asset.name.toLowerCase()}`)}
                        >
                          {asset.free}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#3498DB" }}>Free Pool</Typography>

                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                            color: "#34495E",
                            cursor: "pointer",
                            transition: "transform 0.2s ease-in-out",
                            "&:hover": { transform: "scale(1.2)" },
                            mt: 1,
                          }}
                          onClick={() => navigate(`/total-assets/${asset.name.toLowerCase()}`)}
                        >
                          {asset.total}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#2C3E50" }}>Total</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Modal for Asset Details */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#ECF0F1",
            color: "#34495E",
            p: 4,
            borderRadius: 3,
            textAlign: "center",
            boxShadow: 4,
            maxWidth: 400,
            width: "90%",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: 8, right: 8 }}
            onClick={() => setModalOpen(false)}
          >
            <CloseIcon />
          </IconButton>
          {selectedAsset && (
            <>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                {selectedAsset.name} Details
              </Typography>
              <Typography variant="h6">Total: {selectedAsset.total}</Typography>
              <Typography variant="h6">Assigned: {selectedAsset.assigned}</Typography>
              <Typography variant="h6">Free Pool: {selectedAsset.free}</Typography>
              <Typography variant="h6" sx={{ color: "#E74C3C", fontWeight: "bold" }}>
                Under Maintenance: {selectedAsset.underMaintenance}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default DashBoard;
