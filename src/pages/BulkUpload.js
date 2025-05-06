import React, { useState, useCallback } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Box,
  TablePagination,
  Tabs,
  Tab,
} from "@mui/material";
import { UploadFile, CloudUpload, Delete } from "@mui/icons-material";
import * as XLSX from "xlsx";
import axios from "axios";
import Navbar from "./Navbar";

const FileUploadButton = ({ onFileUpload }) => (
  <label htmlFor="upload-input">
    <input
      type="file"
      accept=".xlsx"
      onChange={onFileUpload}
      style={{ display: "none" }}
      id="upload-input"
    />
    <Button variant="contained" color="primary" component="span" startIcon={<CloudUpload />}>
      Upload Excel
    </Button>
  </label>
);

const ExcelTable = ({ tableData, page, rowsPerPage }) => (
  <TableContainer component={Paper} sx={{ maxHeight: 450 }}>
    <Table stickyHeader>
      <TableHead>
        <TableRow>
          {Object.keys(tableData[0] || {}).map((key) => (
            <TableCell key={key} sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>
              {key}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {tableData
          .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
          .map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {Object.values(row).map((value, cellIndex) => (
                <TableCell key={cellIndex}>{value}</TableCell>
              ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const BulkUpload = () => {
  const [excelData, setExcelData] = useState({});
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [activeSheet, setActiveSheet] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      setSnackbarMessage("❌ Only Excel files (.xlsx) are allowed.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbarMessage("❌ File too large. Max size is 5MB.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    setFileName(file.name);
    setUploadedFile(file);

    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const allSheets = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        allSheets[sheetName] = XLSX.utils.sheet_to_json(sheet);
      });

      setExcelData(allSheets);
      setActiveSheet(workbook.SheetNames[0]);
      setPage(0);
    };
  }, []);

  const handleUpload = async () => {
    if (!fileName || !uploadedFile) {
      setSnackbarMessage("❌ No file uploaded.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const activeData = excelData[activeSheet] || [];
    const requiredFields = Object.keys(activeData[0] || {});
    const isValid = activeData.every(row =>
      requiredFields.every(field => row[field] !== undefined && row[field] !== "")
    );

    if (!isValid) {
      setSnackbarMessage("❌ Some rows are missing required fields.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    const requestedBy = loggedInUser.emp_id;

    if (!requestedBy) {
      setSnackbarMessage("❌ User not logged in. Please log in and try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("requested_by", requestedBy);

    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/bulk/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSnackbarMessage("✅ Upload Successful!");
      setSnackbarSeverity("success");
      setExcelData({});
      setFileName("");
      setUploadedFile(null);
    } catch (error) {
      const errMsg = error?.response?.data?.message || "❌ Error uploading data. Please try again.";
      setSnackbarMessage(errMsg);
      setSnackbarSeverity("error");
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setExcelData({});
    setFileName("");
    setUploadedFile(null);
    setPage(0);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4, maxWidth: 1000, mx: "auto" }}>
        <Card elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
              📂 Bulk Upload Excel (.xlsx)
            </Typography>

            <Box
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith(".xlsx")) {
                  handleFileUpload({ target: { files: [file] } });
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              sx={{
                border: "2px dashed #90caf9",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                mb: 2,
              }}
            >
              <Typography>Drag & drop Excel file here or click below to upload</Typography>
              <FileUploadButton onFileUpload={handleFileUpload} />
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                {fileName && (
                  <Typography color="textSecondary" variant="subtitle1">
                    📄 {fileName}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
                {fileName && (
                  <IconButton color="error" onClick={handleRemoveFile}>
                    <Delete />
                  </IconButton>
                )}
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
              onClick={handleUpload}
              disabled={Object.keys(excelData).length === 0 || loading}
              sx={{ mt: 2, width: "100%" }}
            >
              {loading ? "Uploading..." : "Submit Data"}
            </Button>

            {Object.keys(excelData).length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: "bold" }}>
                  📊 Preview
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", mb: 2 }}>
                  <Tabs
                    value={activeSheet}
                    onChange={(e, newValue) => {
                      setActiveSheet(newValue);
                      setPage(0);
                    }}
                    sx={{ flexGrow: 1, minWidth: 300 }}
                  >
                    {Object.keys(excelData).map((sheet) => (
                      <Tab key={sheet} label={sheet} value={sheet} />
                    ))}
                  </Tabs>
                  <TablePagination
                    component="div"
                    count={excelData[activeSheet]?.length || 0}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    labelRowsPerPage="Rows:"
                    sx={{ mt: { xs: 2, sm: 0 } }}
                  />
                </Box>

                <ExcelTable tableData={excelData[activeSheet]} page={page} rowsPerPage={rowsPerPage} />
              </>
            )}
          </CardContent>
        </Card>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default BulkUpload;
