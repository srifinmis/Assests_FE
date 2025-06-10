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
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [selectedRows, setSelectedRows] = useState({});
    const [searchTerm, setSearchTerm] = useState("");


    const navigate = useNavigate();
    useEffect(() => {
        fetchBOs();
    }, []);

    const fetchBOs = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emp_id2 = loggedInUser.emp_id2;
            const response = await axios.get(`${API_CONFIG.APIURL}/bos/detailsassign`, {
                headers: { emp_id2 }
            });
            setBOs(response.data);
            setData(response.data);
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

    const filteredData = data.filter((row) => {
        const valuesToSearch = [
            row.instakit_no,
            row.unit_id,
            row.unit_name,
            row.asigned_status,
            row.ro_assigned_date,
            row.ro_status,
        ].map(val => val?.toString().toLowerCase());
        return valuesToSearch.some(value => value?.includes(searchTerm.toLowerCase()));
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const visibleData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // const totalPages = Math.ceil(bos.length / rowsPerPage);
    // const visibleData = bos.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const columnHeaders = ["InstaKit NO.", "Unit ID", "Unit Name", "Received Date", "Action"];

    return (
        <>
            <Navbar />
            <Box sx={{ p: 2, width: "100%", maxWidth: "1230px", margin: "auto" }}>
                <Typography variant="h5" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    Assign Customer
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: 1, mb: 2, mt: -2 }}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        size="small"
                        sx={{
                            backgroundColor: "#f0f0f0",
                            borderRadius: 1,
                            maxWidth: 250,
                            mx: 1,
                        }}
                        InputLabelProps={{ sx: { fontSize: "1rem" } }}
                        inputProps={{ style: { fontSize: "1rem" } }}
                    />
                </Box>

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
                                            textAlign: 'center'
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
                                    <TableCell sx={{ textAlign: 'center' }}>{bo.instakit_no}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{bo.unit_id}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{bo.unit_name}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{bo.ro_assigned_date}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
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