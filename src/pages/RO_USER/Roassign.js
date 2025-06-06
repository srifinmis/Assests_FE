import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Autocomplete } from "@mui/material";
import {
    Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, Tabs, Tab,
    Paper, Typography, Card, CardContent, Grid, Snackbar,
    Alert, CircularProgress, IconButton, TextField, MenuItem,
    Pagination, PaginationItem, Checkbox, Button,
} from "@mui/material";
import { UploadFile, CloudUpload, Delete } from "@mui/icons-material";
import * as XLSX from "xlsx";
import Navbar from "../Navbar";

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

const ROAssign = () => {
    const [ros, setROs] = useState([]);
    const [bos, setBOIds] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [selectedRows, setSelectedRows] = useState({});
    const [boId, setBoId] = useState("");
    const [boName, setBoName] = useState("");
    const [boData, setBoData] = React.useState({});
    const [selectedDocketIds, setSelectedDocketIds] = React.useState({});
    const [excelData, setExcelData] = useState({});
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [activeSheet, setActiveSheet] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);


    useEffect(() => {
        fetchROs();
        fetchBOIds();
    }, []);

    const fetchROs = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emp_id = loggedInUser.emp_id;
            const response = await axios.get(`${API_CONFIG.APIURL}/ros/detailsassign`, {
                headers: {
                    "emp_id": emp_id
                }
            });
            setROs(response.data);
        } catch (error) {
            console.error("Error fetching ros:", error);
        }
    }

    const fetchBOIds = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.APIURL}/bos/boiddropdown`);
            console.log('response bousers: ', response)
            setBOIds(response.data);
        } catch (error) {
            console.error("Error fetching ros:", error);
        }
    };

    /////////bulk code
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
            const requiredColumns = ["Instakit", "Unit ID", "Unit Name", "Assignment Status", "Pod", "Remarks"];
            const requiredColumnSet = new Set(requiredColumns);

            let isValid = true;
            let errorSheet = "";

            workbook.SheetNames.forEach((sheetName) => {
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);

                if (jsonData.length === 0) return;

                const headers = Object.keys(jsonData[0]);
                const headerSet = new Set(headers);

                const hasAllRequired = requiredColumns.every(col => headerSet.has(col));
                const isExactMatch = headerSet.size === requiredColumnSet.size &&
                    [...headerSet].every(col => requiredColumnSet.has(col));

                if (!hasAllRequired || !isExactMatch) {
                    isValid = false;
                    errorSheet = sheetName;
                } else {
                    allSheets[sheetName] = jsonData;
                }
            });

            if (!isValid) {
                setSnackbarMessage(`❌ Sheet "${errorSheet}" must contain exactly these 6 columns: ${requiredColumns.join(", ")}`);
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                setExcelData({});
                setUploadedFile(null);
                setFileName("");
                return;
            }

            setExcelData(allSheets);
            setActiveSheet(workbook.SheetNames[0]);
            setPage(0);
        };
    }, []);

    const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

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
            console.log("bulk accept upload: ", formData)
            await axios.post(`${API_CONFIG.APIURL}/bulk/upload-roassignbo`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setSnackbarMessage("✅ Upload Sent to Branch Successful!");
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

    const totalPages = Math.ceil(ros.length / rowsPerPage);
    const visibleData = ros.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const columnHeaders = ["InstaKit NO.", "RO ID", "RO Name", "Assigned Status", "BO ID"];

    const allVisibleSelected = visibleData.every(row => selectedRows[row.instakit_no]);
    const anySelected = Object.values(selectedRows).some(Boolean);

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        const updatedSelections = { ...selectedRows };
        visibleData.forEach((row) => {
            updatedSelections[row.instakit_no] = checked;
        });
        setSelectedRows(updatedSelections);
    };

    const handleRowSelect = (instakit_no) => {
        setSelectedRows((prev) => ({
            ...prev,
            [instakit_no]: !prev[instakit_no]
        }));
    };
    const handleAssign = async () => {
        const selectedDocketIds = Object.keys(selectedRows).filter(id => selectedRows[id]);

        const boIds = selectedDocketIds.map(id => boData[id]?.boId || "");
        console.log("Form data: ", selectedDocketIds, boIds);

        try {
            const response = await axios.post(`${API_CONFIG.APIURL}/ros/assign`, {
                docketIds: selectedDocketIds,
                ro_assigned_to: boIds
            });

            console.log("Success:", response.data);
            alert("Selected rows assigned successfully.");
            setROs((prevRos) => prevRos.filter((row) => !selectedDocketIds.includes(row.instakit_no)));
            setSelectedRows({});
        } catch (error) {
            console.error("Assign failed:", error);
            alert("Failed to assign selected rows.");
        }
    };
    const isAssignDisabled = !anySelected || !Object.entries(selectedRows).every(([id, selected]) => {
        if (!selected) return true;
        const data = boData[id];
        return data && data.boId;
    });

    return (
        <>
            <Navbar />
            <Box sx={{ p: 2, width: "100%", maxWidth: "1230px", margin: "auto" }}>
                {/* Centered Page Title Outside Table */}
                <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    ASSIGN
                </Typography>

                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"
                                    sx={{
                                        // p: "4px",
                                        fontSize: "0.78rem",
                                        fontWeight: "bold",
                                        backgroundColor: "lightgrey",
                                        borderRight: "1px solid white",
                                        borderLeft: "1px solid white",
                                    }}
                                >
                                    <Checkbox
                                        checked={allVisibleSelected && visibleData.length > 0}
                                        onChange={handleSelectAll}
                                        indeterminate={anySelected && !allVisibleSelected}
                                    />
                                </TableCell>
                                {columnHeaders.map((header) => (
                                    <TableCell
                                        key={header}
                                        sx={{
                                            p: "4px",
                                            fontSize: "0.78rem",
                                            fontWeight: "bold",
                                            backgroundColor: "lightgrey",
                                            borderRight: "1px solid white",
                                            borderLeft: "1px solid white",
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visibleData.map((ro, index) => (
                                <TableRow key={index} hover>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={!!selectedRows[ro.instakit_no]}
                                            onChange={() => handleRowSelect(ro.instakit_no)}
                                        />
                                    </TableCell>
                                    <TableCell>{ro.instakit_no}</TableCell>
                                    <TableCell>{ro.unit_id}</TableCell>
                                    <TableCell>{ro.unit_name}</TableCell>
                                    <TableCell>{ro.ro_status}</TableCell>

                                    {/* NEW: BO ID input field */}
                                    <TableCell sx={{ width: '250px' }}>
                                        <Autocomplete
                                            options={bos}
                                            getOptionLabel={(option) =>
                                                option?.emp_id && option?.emp_name ? `${option.emp_id} - ${option.emp_name}` : ""
                                            }
                                            isOptionEqualToValue={(option, value) => option.emp_id === value.emp_id}
                                            disabled={!selectedRows[ro.instakit_no]}
                                            value={
                                                bos.find((bo) => bo.emp_id === boData[ro.instakit_no]?.boId) || null
                                            }
                                            onChange={(event, newValue) => {
                                                setBoData((prev) => ({
                                                    ...prev,
                                                    [ro.instakit_no]: {
                                                        ...prev[ro.instakit_no],
                                                        boId: newValue ? newValue.emp_id : "",
                                                    },
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="BO ID"
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder="Select BO"
                                                />
                                            )}
                                        />
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination and Footer */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 2, px: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2">Rows per page:</Typography>
                        <TextField
                            select
                            size="small"
                            value={rowsPerPage}
                            onChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(1);
                            }}
                            sx={{ width: 80 }}
                        >
                            {[5, 10, 15, 20, 25, 50, 75].map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {/* <TextField
                            label="BO ID"
                            variant="outlined"
                            size="small"
                            value={boId}
                            onChange={(e) => setBoId(e.target.value)}
                        />
                        <TextField
                            label="BO Name"
                            variant="outlined"
                            size="small"
                            value={boName}
                            onChange={(e) => setBoName(e.target.value)}
                        /> */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAssign}
                            disabled={isAssignDisabled}
                        >
                            Assign
                        </Button>

                    </Box>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, newPage) => setPage(newPage)}
                        variant="outlined"
                        shape="rounded"
                        color="primary"
                        showFirstButton
                        showLastButton
                        renderItem={(item) => (
                            <PaginationItem
                                components={{ first: "span", last: "span" }}
                                {...item}
                                slots={{
                                    first: () => <span>{"<<"}</span>,
                                    last: () => <span>{">>"}</span>,
                                }}
                            />
                        )}
                    />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1, ml: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {ros.length === 0
                            ? "No entries found"
                            : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(
                                page * rowsPerPage,
                                ros.length
                            )} of ${ros.length} entries`}
                    </Typography>
                </Box>
            </Box>

            {/* BULK UPLOAD CODE */}
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
                            sx={{ mt: 2, width: "30%" }}
                        >
                            {loading ? "Uploading..." : "Submit Data"}
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            component="a"
                            href="/Formate.xlsx"
                            download
                            sx={{ mt: 2, ml: 2, width: "25%" }}
                        >
                            Download Format
                        </Button>

                        {Object.keys(excelData).length > 0 && (
                            <>
                                <Typography variant="h6" sx={{ mt: 4, mb: 1, fontWeight: "bold" }}>
                                    📊 Preview Uploading Data
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
export default ROAssign;