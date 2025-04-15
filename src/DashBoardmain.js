import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import Navbar from "./pages/Navbar";
const Dashboardmain = () => {
  const navigate = useNavigate();

  const mainSections = [
    { title: "Reports", route: "/components/dashboardreports", color: "#2980B9" },
    { title: "Asset Management", route: "/DashBoard", color: "#2ECC71" },
  ];

  return (
    <>
    <Navbar />
    <Box sx={{ marginTop: "70px" }}>
      <Grid container spacing={3} justifyContent="center">
        {mainSections.map((section, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                ...cardStyle,
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  ...cardStyle["&:hover"],
                  backgroundColor: "#D5DBDB",
                  boxShadow: "0px 6px 12px rgba(0,0,0,0.2)",
                },
              }}
              onClick={() => navigate(section.route)}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", textAlign: "center", color: section.color }}
                >
                  {section.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    </>
  );
};

const cardStyle = {
  backgroundColor: "#ECF0F1",
  borderRadius: 3,
  p: 2,
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
  cursor: "pointer",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.05)",
  },
};

export default Dashboardmain;
