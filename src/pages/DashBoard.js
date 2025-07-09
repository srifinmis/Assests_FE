import React, { useState, useEffect } from "react";
import { Box, Grid, Card, CardContent, Typography, Modal, CircularProgress, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PrintIcon from '@mui/icons-material/Print';
import SimCardIcon from '@mui/icons-material/SimCard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const assetIcons = {
  laptop: LaptopMacIcon,
  mobile: SmartphoneIcon,
  biometric: FingerprintIcon,
  printer: PrintIcon,
  'data card': CreditCardIcon,
  'sim card': SimCardIcon,
  'cug sim card': BadgeIcon,
  license: AssignmentIndIcon,
};

const assetColors = {
  laptop: '#4CAF50',        // Green
  mobile: '#009688',        // Teal (changed from Deep Orange)
  biometric: '#FF9800',     // Orange
  printer: '#FF5722',       // Deep Orange (changed from Indigo)
  'data card': '#9C27B0',   // Purple (changed from Teal)
  'sim card': '#3F51B5',    // Indigo (changed from Purple)
  'cug sim card': '#607D8B',// Blue Grey
  license: '#8D6E63',       // Brown
};

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
        setError("Welcome To Asset Management");
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
            {assets.map((asset, index) => {
              const IconComponent = assetIcons[asset.name.toLowerCase()] || LaptopMacIcon;
              const accentColor = assetColors[asset.name.toLowerCase()] || '#1976d2';
              
              // Create gradient based on accent color
              const gradientColors = {
                laptop: 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 50%, #A5D6A7 100%)',
                mobile: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 50%, #80CBC4 100%)',
                biometric: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)',
                printer: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 50%, #FFAB91 100%)',
                'data card': 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 50%, #CE93D8 100%)',
                'sim card': 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 50%, #9FA8DA 100%)',
                'cug sim card': 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 50%, #B0BEC5 100%)',
                license: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 50%, #BCAAA4 100%)',
              };
              
              const cardGradient = gradientColors[asset.name.toLowerCase()] || gradientColors.laptop;
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    sx={{
                      background: cardGradient,
                      color: '#2c3e50',
                      borderRadius: 4,
                      border: `1px solid ${accentColor}40`,
                      boxShadow: `0 8px 24px 0 ${accentColor}20, 0 4px 12px 0 rgba(0,0,0,0.08)`,
                      p: 2,
                      minHeight: 260,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.3s, transform 0.2s',
                      '&:hover': {
                        boxShadow: `0 16px 40px 0 ${accentColor}40, 0 8px 20px 0 rgba(0,0,0,0.15)`,
                        transform: 'translateY(-4px) scale(1.02)',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <CardContent sx={{ position: 'relative', minHeight: 120, zIndex: 1 }}>
                      {/* Elegant background icon */}
                      <IconComponent
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          fontSize: 100,
                          opacity: 0.12,
                          color: accentColor,
                          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
                          transform: 'translate(-50%, -50%)',
                          pointerEvents: 'none',
                          zIndex: 0,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          textAlign: 'center',
                          mb: 2,
                          color: accentColor,
                          position: 'relative',
                          zIndex: 1,
                          fontSize: '1.2rem',
                          letterSpacing: 0.5,
                        }}
                      >
                        {asset.name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                          position: 'relative',
                          zIndex: 1,
                          gap: 2,
                        }}
                      >
                        {/* Hide Assigned & Maintenance in Total Assets Page */}
                        {!isTotalAssetsPage && (
                          <Box sx={{ textAlign: 'center', flex: 1 }}>
                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                color: accentColor,
                                mb: 0.5,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.15)' },
                              }}
                              onClick={() => navigate(`/assigned/${asset.name.toLowerCase()}`)}
                            >
                              {asset.assigned}
                            </Typography>
                            <Typography variant="body2" sx={{ color: accentColor, fontWeight: 600, fontSize: '0.9rem' }}>Assigned</Typography>

                            <Typography
                              variant="h4"
                              sx={{
                                fontWeight: 800,
                                color: '#d32f2f',
                                mt: 1.5,
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'scale(1.15)' },
                              }}
                              onClick={() => navigate(`/maintenance/${asset.name.toLowerCase()}`)}
                            >
                              {asset.underMaintenance}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600, fontSize: '0.8rem' }}>Under Maintenance</Typography>
                          </Box>
                        )}

                        {/* Free Pool & Total */}
                        <Box sx={{ textAlign: 'center', flex: 1 }}>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              color: '#1976d2',
                              mb: 0.5,
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.15)' },
                            }}
                            onClick={() => navigate(`/free-pool/${asset.name.toLowerCase()}`)}
                          >
                            {asset.free}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600, fontSize: '0.9rem' }}>Free Pool</Typography>

                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              color: '#2c3e50',
                              mt: 1.5,
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.15)' },
                            }}
                            onClick={() => navigate(`/total-assets/${asset.name.toLowerCase()}`)}
                          >
                            {asset.total}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 600, fontSize: '0.9rem' }}>Total</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
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
