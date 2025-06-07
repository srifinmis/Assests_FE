// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//     Box,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
//     Typography,
//     TextField,
//     MenuItem,
//     Pagination,
//     PaginationItem,
// } from "@mui/material";
// import Navbar from "../Navbar";

// const HOReport = () => {
//     const [ros, setROs] = useState([]);
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [page, setPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(15);

//     useEffect(() => {
//         fetchReport();
//     }, []);

//     const { API_CONFIG } = require('../../configuration');

//     const fetchReport = async () => {
//         try {

//             const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
//             const emp_id = loggedInUser.emp_id;
//             const res = await axios.get(`${API_CONFIG.APIURL}/ros/ho-report`, {
//                 headers: { emp_id }
//             });
//             console.log("response report data: ", res.data.ho_assigned_to)
//             setData(res.data);
//         } catch (err) {
//             console.error("Failed to fetch HO report:", err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const totalPages = Math.ceil(data.length / rowsPerPage);
//     const visibleData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//     const columnHeaders = ["InstaKit NO.", "Unit ID", "Unit Name", "Assigned Date", "Pod", "Status"];

//     return (
//         <>
//             <Navbar />
//             <Box sx={{ p: 2, maxWidth: "1230px", mx: "auto" }}>
//                 <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
//                     Report
//                 </Typography>

//                 <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 240px)" }}>
//                     <Table stickyHeader>
//                         <TableHead>
//                             <TableRow>
//                                 {columnHeaders.map((header) => (
//                                     <TableCell
//                                         key={header}
//                                         sx={{
//                                             p: "4px",
//                                             fontSize: "0.78rem",
//                                             fontWeight: "bold",
//                                             backgroundColor: "lightgrey",
//                                             borderRight: "1px solid white",
//                                             borderLeft: "1px solid white",
//                                             textAlign: 'center'
//                                         }}
//                                     >
//                                         {header}
//                                     </TableCell>
//                                 ))}
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {visibleData.map((ro, index) => (
//                                 <TableRow key={index} hover>
//                                     <TableCell sx={{ textAlign: 'center' }}>{ro.docket_id}</TableCell>
//                                     <TableCell sx={{ textAlign: 'center' }}>{ro.ho_assigned_to}</TableCell>
//                                     <TableCell sx={{ textAlign: 'center' }}>
//                                         {ro.ho_assigned_to === "ROUSER"
//                                             ? ro.ro_name
//                                             : ro.ho_assigned_to === "BOUSER" || "BOUSER2"
//                                                 ? ro.bo_name
//                                                 : "-"}
//                                     </TableCell>
//                                     <TableCell sx={{ textAlign: 'center' }}>{ro.ho_assigned_date}</TableCell>
//                                     <TableCell sx={{ textAlign: 'center' }}>{ro.pod}</TableCell>
//                                     <TableCell sx={{ textAlign: 'center' }}>{ro.status}</TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>

//                 {/* Pagination */}
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
//                     <TextField
//                         select
//                         value={rowsPerPage}
//                         onChange={(e) => {
//                             setRowsPerPage(parseInt(e.target.value));
//                             setPage(1);
//                         }}
//                         size="small"
//                         sx={{ width: 100 }}
//                     >
//                         {[5, 10, 15, 20, 25].map((val) => (
//                             <MenuItem key={val} value={val}>
//                                 {val}
//                             </MenuItem>
//                         ))}
//                     </TextField>

//                     <Pagination
//                         count={totalPages}
//                         page={page}
//                         onChange={(_, newPage) => setPage(newPage)}
//                         variant="outlined"
//                         shape="rounded"
//                         showFirstButton
//                         showLastButton
//                         color="primary"
//                     />
//                 </Box>

//                 <Box sx={{ mt: 1 }}>
//                     <Typography variant="body2" color="text.secondary">
//                         {ros.length === 0
//                             ? "No entries found"
//                             : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(
//                                 page * rowsPerPage,
//                                 ros.length
//                             )} of ${ros.length} entries`}
//                     </Typography>
//                 </Box>
//             </Box>
//         </>
//     );
// };

// export default HOReport;


import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Pagination,
    PaginationItem,
} from "@mui/material";
import Navbar from "../Navbar";
import * as XLSX from "xlsx";


const HOReport = () => {
    const [ros, setROs] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchReport();
    }, []);

    const { API_CONFIG } = require('../../configuration');

    const fetchReport = async () => {
        try {

            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emp_id = loggedInUser.emp_id;
            const res = await axios.get(`${API_CONFIG.APIURL}/ros/ho-report`, {
                headers: { emp_id }
            });
            console.log("response report data: ", res.data.ho_assigned_to)
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch HO report:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        const exportData = filteredData.length ? filteredData : data;

        const rows = exportData.map((ro) => ({
            "InstaKit NO.": ro.docket_id,
            "Unit ID": ro.ho_assigned_to,
            "Unit Name":
                ro.ho_assigned_to === "ROUSER"
                    ? ro.ro_name
                    : ro.ho_assigned_to === "BOUSER" || ro.ho_assigned_to === "BOUSER2"
                        ? ro.bo_name
                        : "-",
            "Assigned Date": ro.ho_assigned_date,
            "Pod": ro.pod,
            "Status": ro.status,
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        const date = new Date().toISOString().split('T')[0];
        const filename = `Report_${date}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };

    const filteredData = data.filter((row) => {
        const valuesToSearch = [
            row.docket_id,
            row.ho_assigned_to,
            row.ro_name,
            row.bo_name,
            row.ho_assigned_date,
            row.pod,
            row.status
        ].map(val => val?.toString().toLowerCase());
        return valuesToSearch.some(value => value?.includes(searchTerm.toLowerCase()));
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const visibleData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const columnHeaders = ["InstaKit NO.", "Unit ID", "Unit Name", "Assigned Date", "Pod", "Status"];

    return (
        <>
            <Navbar />
            <Box sx={{ p: 2, maxWidth: "1230px", mx: "auto" }}>
                <Box
                    sx={{
                        bgcolor: "white",
                        color: "black",
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 0,
                        borderRadius: 1,
                    }}
                >
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start" }} />
                    <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.4rem", textAlign: "center", flex: 1 }}>
                        REPORT
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flex: 1 }}>
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

                        <button
                            onClick={handleDownload}
                            style={{
                                fontWeight: "bold",
                                height: "40px", fontSize: "1rem", width: 160, marginLeft: 8
                            }}
                        >
                            Download
                        </button>
                    </Box>
                </Box>

                <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 240px)" }}>
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
                            {visibleData.map((ro, index) => (
                                <TableRow key={index} hover>
                                    <TableCell sx={{ textAlign: 'center' }}>{ro.docket_id}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{ro.ho_assigned_to}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        {ro.ho_assigned_to === "ROUSER"
                                            ? ro.ro_name
                                            : ro.ho_assigned_to === "BOUSER" || "BOUSER2"
                                                ? ro.bo_name
                                                : "-"}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{ro.ho_assigned_date}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{ro.pod}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{ro.status}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
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

                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {data.length === 0
                            ? "No entries found"
                            : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, data.length)} of ${data.length} entries`}
                    </Typography>
                </Box>
            </Box>
        </>
    );
};

export default HOReport;      
