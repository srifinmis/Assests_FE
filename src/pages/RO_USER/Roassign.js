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

// const RO = () => {
//     const [ros, setROs] = useState([]);
//     const [page, setPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(15);

//     useEffect(() => {
//         fetchROs();
//     }, []);

//     const fetchROs = async () => {
//         try {
//             const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
//             const emp_id = loggedInUser.emp_id;
//             const response = await axios.get("http://localhost:2727/api/ros/detailsassign", {
//                 headers: {
//                     "emp_id": emp_id
//                 }
//             });
//             setROs(response.data);
//         } catch (error) {
//             console.error("Error fetching ros:", error);
//         }
//     };


//     const totalPages = Math.ceil(ros.length / rowsPerPage);
//     const visibleData = ros.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//     const columnHeaders = ["InstaKit NO.", "RO ID", "RO Name", "Assigned Status"];

//     return (
//         <>
//             <Navbar />
//             <Box sx={{ p: 2, width: "100%", maxWidth: "1230px", margin: "auto" }}>
//                 {/* Centered Page Title Outside Table */}
//                 <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
//                     RO Assign
//                 </Typography>

//                 <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 240px)", overflowY: "auto" }}>
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
//                                     <TableCell>{ro.instakit_no}</TableCell>
//                                     <TableCell>{ro.unit_id}</TableCell>
//                                     <TableCell>{ro.unit_name}</TableCell>
//                                     <TableCell>{ro.assigned_status}</TableCell>
//                                     {/* <TableCell>{ro.po_number}</TableCell> */}
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>

//                 {/* Pagination and Footer */}
//                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", my: 2, px: 2 }}>
//                     <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                         <Typography variant="body2">Rows per page:</Typography>
//                         <TextField
//                             select
//                             size="small"
//                             value={rowsPerPage}
//                             onChange={(e) => {
//                                 setRowsPerPage(parseInt(e.target.value, 10));
//                                 setPage(1);
//                             }}
//                             sx={{ width: 80 }}
//                         >
//                             {[5, 10, 15, 20, 25, 50, 75].map((option) => (
//                                 <MenuItem key={option} value={option}>
//                                     {option}
//                                 </MenuItem>
//                             ))}
//                         </TextField>
//                     </Box>

//                     <Pagination
//                         count={totalPages}
//                         page={page}
//                         onChange={(_, newPage) => setPage(newPage)}
//                         variant="outlined"
//                         shape="rounded"
//                         color="primary"
//                         showFirstButton
//                         showLastButton
//                         renderItem={(item) => (
//                             <PaginationItem
//                                 components={{ first: "span", last: "span" }}
//                                 {...item}
//                                 slots={{
//                                     first: () => <span>{"<<"}</span>,
//                                     last: () => <span>{">>"}</span>,
//                                 }}
//                             />
//                         )}
//                     />
//                 </Box>

//                 <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1, ml: 1 }}>
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
// export default RO;


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
    Checkbox,
    Button,
} from "@mui/material";
import Navbar from "../Navbar";

const ROAssign = () => {
    const [ros, setROs] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [selectedRows, setSelectedRows] = useState({});
    const [boId, setBoId] = useState("");
    const [boName, setBoName] = useState("");

    useEffect(() => {
        fetchROs();
    }, []);

    const fetchROs = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const emp_id = loggedInUser.emp_id;
            const response = await axios.get("http://localhost:2727/api/ros/detailsassign", {
                headers: {
                    "emp_id": emp_id
                }
            });
            setROs(response.data);
        } catch (error) {
            console.error("Error fetching ros:", error);
        }
    };


    const totalPages = Math.ceil(ros.length / rowsPerPage);
    const visibleData = ros.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const columnHeaders = ["InstaKit NO.", "RO ID", "RO Name", "Assigned Status"];

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
        const selectedDocketIds = ros
            .filter((row) => selectedRows[row.instakit_no])
            .map((row) => row.instakit_no);

        try {
            const response = await axios.post("http://localhost:2727/api/ros/assign", {
                docketIds: selectedDocketIds,
                ro_assigned_to: boId,
                bo_name: boName
            });

            console.log("Success:", response.data);
            alert("Selected rows assigned successfully.");
            setROs((prevRos) => prevRos.filter((row) => !selectedDocketIds.includes(row.instakit_no)));
            setSelectedRows({}); // Clear selection
        } catch (error) {
            console.error("Assign failed:", error);
            alert("Failed to assign selected rows.");
        }
    };

    return (
        <>
            <Navbar />
            <Box sx={{ p: 2, width: "100%", maxWidth: "1230px", margin: "auto" }}>
                {/* Centered Page Title Outside Table */}
                <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: "bold" }}>
                    RO Assign
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
                                    <TableCell>{ro.assigned_status}</TableCell>
                                    {/* <TableCell>{ro.po_number}</TableCell> */}
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
                        <TextField
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
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAssign}
                            disabled={!anySelected || !boId || !boName}
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
        </>
    );
};
export default ROAssign;