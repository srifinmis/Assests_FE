import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow,
    Paper, Typography, TextField,
    MenuItem, Pagination,
} from "@mui/material";
import Navbar from "../Navbar";

const ROReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    const { API_CONFIG } = require('../../configuration');

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emp_id = loggedInUser.emp_id;
            const res = await axios.get(`${API_CONFIG.APIURL}/ros/ro-report`, {
                headers: { emp_id }
            });
            console.log('api response : ', res)
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch RO report:", err);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(data.length / rowsPerPage);
    const visibleData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const columnHeaders = [
        "InstaKit NO.",
        "Unit ID",
        "Unit Name",
        "Received Date",
        "Accepted Date",
        "Assigned Date",
        "Status",
        "Remarks"
    ];

    return (
        <>
            <Navbar />
            <Box sx={{ p: 2, maxWidth: "1230px", mx: "auto" }}>
                <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    Report
                </Typography>

                {loading ? (
                    <Box sx={{ textAlign: "center", mt: 4 }}>
                        <Typography variant="body1">Loading...</Typography>
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 240px)" }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow >
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
                                                    textAlign: "center",
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
                                            <TableCell>{ro.docket_id}</TableCell>
                                            <TableCell>{ro.ro_assigned_to}</TableCell>
                                            <TableCell>{ro.bo_name}</TableCell>
                                            <TableCell>{ro.ho_assigned_date}</TableCell>
                                            <TableCell>{ro.ro_accepted_date}</TableCell>
                                            <TableCell>{ro.ro_assigned_date}</TableCell>
                                            <TableCell>{ro.ro_status}</TableCell>
                                            <TableCell>{ro.remarks}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination Controls */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                            <TextField
                                select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(parseInt(e.target.value));
                                    setPage(1);
                                }}
                                size="small"
                                sx={{ width: 100 }}
                            >
                                {[5, 10, 15, 20, 25].map((val) => (
                                    <MenuItem key={val} value={val}>
                                        {val}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(_, newPage) => setPage(newPage)}
                                variant="outlined"
                                shape="rounded"
                                showFirstButton
                                showLastButton
                                color="primary"
                            />
                        </Box>

                        {/* Summary */}
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {data.length === 0
                                    ? "No entries found"
                                    : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, data.length)} of ${data.length} entries`}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>
        </>
    );
};

export default ROReport;
