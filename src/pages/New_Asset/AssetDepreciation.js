import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import axios from "axios";
import * as XLSX from "xlsx";
import { Search, IosShare } from "@mui/icons-material";
import {
  Card,
  CardContent,
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
  TablePagination,
  TableSortLabel,
  Tooltip,
} from "@mui/material";

const AssetDepreciationTable = () => {
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("asset_id");

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/depreciation/asset-depreciation-values")
      .then((response) => {
        setAssets(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching asset details:", error);
        setError("Failed to load assets.");
        setLoading(false);
      });
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filteredAssets = assets.filter((item) =>
    [
      item.asset_id,
      item.asset_type,
      item.po_number,
      item.serial_number,
      item.invoice_number,
      item.utr_number,
    ]
      .some((field) =>
        field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const exportToExcel = () => {
    const formattedData = filteredAssets.map((asset) => ({
      "Asset ID": asset.asset_id,
      "Asset Type": asset.asset_type,
      "Serial Number": asset.serial_number,
      "PO Number": asset.po_number,
      "Invoice Number": asset.invoice_number,
      "UTR Number": asset.utr_number,
      "Warranty": asset.warranty,
      "Asset Value": asset.asset_value,
      "Asset Value incl. GST": asset.asset_value_gst,
      "Salvage Value": asset.salvage_value,
      "Depreciation Value": asset.depreciation_value,
      "1-Year Value": asset.year1,
      "2-Year Value": asset.year2,
      "3-Year Value": asset.year3,
      "4-Year Value": asset.year4,
      "5-Year Value": asset.year5,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Depreciation");
    XLSX.writeFile(workbook, "Asset_Depreciation_List.xlsx");
  };

  const sortedAssets = filteredAssets.sort((a, b) => {
    if (orderBy === "asset_id") {
      return order === "asc"
        ? a.asset_id - b.asset_id
        : b.asset_id - a.asset_id;
    }
    return 0;
  });

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

  return (
    <>
      <Navbar />
      <Box sx={{ padding: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "bold",
            color: "#1976D2",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Depreciation Values of Assets

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>

            <Tooltip title="Export to Excel">
              <IconButton sx={{ color: "#1976D2" }} onClick={exportToExcel}>
                <IosShare />
              </IconButton>
            </Tooltip>
          </Box>
        </Typography>

        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#F4F6F8" }}>
                {[
                  "Asset ID", "Asset Type", "Serial Number", "PO Number",
                  "Invoice Number", "UTR Number", "Warranty (in years)", "Asset Value",
                  "Asset Value incl. GST", "Salvage Value", "Depreciation Value",
                  "1-Year Value", "2-Year Value", "3-Year Value", "4-Year Value", "5-Year Value"
                ].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: "bold", color: "#37474F" }}>
                    <TableSortLabel
                      active={orderBy === header.toLowerCase().replace(/\s+/g, '')}
                      direction={order}
                      onClick={(event) => handleRequestSort(event, header.toLowerCase().replace(/\s+/g, ''))}
                    >
                      {header}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedAssets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.asset_id} hover>
                  <TableCell>{row.asset_id}</TableCell>
                  <TableCell>{row.asset_type}</TableCell>
                  <TableCell>{row.serial_number}</TableCell>
                  <TableCell>{row.po_number}</TableCell>
                  <TableCell>{row.invoice_number}</TableCell>
                  <TableCell>{row.utr_number}</TableCell>
                  <TableCell>{row.warranty}</TableCell>
                  <TableCell>{row.asset_value}</TableCell>
                  <TableCell>{row.asset_value_gst}</TableCell>
                  <TableCell>{row.salvage_value}</TableCell>
                  <TableCell>{row.depreciation_value}</TableCell>
                  <TableCell>{row.year1}</TableCell>
                  <TableCell>{row.year2}</TableCell>
                  <TableCell>{row.year3}</TableCell>
                  <TableCell>{row.year4}</TableCell>
                  <TableCell>{row.year5}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredAssets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </>
  );
};

export default AssetDepreciationTable;
