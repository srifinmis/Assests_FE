import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography,
    TextField, MenuItem, Pagination, TablePagination, Tabs, Tab,
    PaginationItem, Button,
} from "@mui/material";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

const BOassign = () => {
    const [bos, setBOs] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [selectedRows, setSelectedRows] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchBOs();
    }, []);

    const fetchBOs = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emp_id = loggedInUser.emp_id;
            const response = await axios.get("http://localhost:2727/api/bos/detailsassign", {
                headers: { "emp_id": emp_id }
            });
            setBOs(response.data);
        } catch (error) {
            console.error("Error fetching bos:", error);
        }
    };

    const handleAssign = (bo) => {
        navigate("/bo-user/assign-bo", {
            state: {
                instakit_no: bo.instakit_no,
            },
        });
    };


    const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

    const totalPages = Math.ceil(bos.length / rowsPerPage);
    const visibleData = bos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const columnHeaders = ["InstaKit NO.", "Unit ID", "Unit Name", "Status", "POD", "Action"];

    return (
        <>
            <Navbar />
            <Box sx={{ p: 2, width: "100%", maxWidth: "1230px", margin: "auto" }}>
                <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    Assign Customer
                </Typography>

                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
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
                            {visibleData.map((bo, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{bo.instakit_no}</TableCell>
                                    <TableCell>{bo.unit_id}</TableCell>
                                    <TableCell>{bo.unit_name}</TableCell>
                                    <TableCell>{bo.assigned_status}</TableCell>
                                    <TableCell>{bo.po_number}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleAssign(bo)}
                                            // disabled={bo.assigned_status === "Y"}
                                        >
                                            Assign
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Accept Button & Pagination */}
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
                        {bos.length === 0
                            ? "No entries found"
                            : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(
                                page * rowsPerPage,
                                bos.length
                            )} of ${bos.length} entries`}
                    </Typography>
                </Box>
            </Box>
        </>
    );
};

export default BOassign;