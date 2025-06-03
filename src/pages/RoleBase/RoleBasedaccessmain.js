// import React, { useState, useEffect } from "react";
// import Navbar from "../Navbar";
// import {
//     TextField,
//     Button,
//     Grid,
//     Box,
//     Typography,
//     Autocomplete,
//     Paper,
//     Snackbar,
//     Alert as MuiAlert,
// } from "@mui/material";

// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const RoleChange = ({ isDropped }) => {
//     const navigate = useNavigate();
//     const [employeeList, setEmployeeList] = useState([]);
//     const [roleList, setRoleList] = useState([]);
//     const [snackbarOpen, setSnackbarOpen] = useState(false);
//     const [snackbarMessage, setSnackbarMessage] = useState("");
//     const [snackbarSeverity, setSnackbarSeverity] = useState("success");
//     const [stateList, setStateList] = useState([]);

//     const [roleError, setRoleError] = useState(false);

//     const [formData, setFormData] = useState({
//         emp_id: "",
//         roles: [],
//         states: [],
//     });

//     const handleSnackbarClose = () => {
//         setSnackbarOpen(false);
//     };

//     const { API_CONFIG, REFRESH_CONFIG } = require('../../configuration');

//     useEffect(() => {
//         const fetchEmployeeData = async () => {
//             try {
//                 const response = await axios.get(`${API_CONFIG.APIURL}/role/emp_idname`);
//                 if (Array.isArray(response.data?.data)) {
//                     setEmployeeList(response.data.data.map(item => ({
//                         emp_id: item.emp_id,
//                         emp_name: item.emp_name,
//                         role_ids_assigned: item.role_ids_assigned
//                     })));
//                 }
//             } catch (error) {
//                 console.error("Error fetching employee data:", error);
//             }
//         };

//         const fetchRoles = async () => {
//             try {
//                 const response = await axios.get(`${API_CONFIG.APIURL}/role/list`);
//                 if (Array.isArray(response.data?.data)) {
//                     setRoleList(response.data.data);
//                 }
//             } catch (error) {
//                 console.error("Error fetching roles:", error);
//             }
//         };

//         const fetchStates = async () => {
//             try {
//                 const response = await axios.get(`${API_CONFIG.APIURL}/dashboard/distinct-states`);
//                 if (Array.isArray(response.data)) {
//                     setStateList(["Select All", ...response.data]);
//                 }
//             } catch (error) {
//                 console.error("Error fetching states:", error);
//             }
//         };

//         fetchEmployeeData();
//         fetchRoles();
//         fetchStates();
//     }, []);

//     const handleEmpChange = (event, newValue) => {
//         if (newValue) {
//             const assignedRoleIds = newValue.role_ids_assigned
//                 ? newValue.role_ids_assigned.split(',').map(id => parseInt(id.trim()))
//                 : [];

//             const assignedRoles = roleList.filter(role =>
//                 assignedRoleIds.includes(role.role_id)
//             );

//             setFormData({
//                 emp_id: newValue.emp_id,
//                 roles: assignedRoles,
//                 states: [], // Reset states on change
//             });
//         } else {
//             setFormData({ emp_id: "", roles: [], states: [] });
//         }
//     };

//     const handleRoleChange = (event, newValue) => {
//         setFormData(prev => ({
//             ...prev,
//             roles: newValue,
//         }));
//         if (newValue.length > 0) {
//             setRoleError(false);
//         }
//     };

//     const handleStateChange = (event, newValue) => {
//         if (newValue.includes("Select All")) {
//             setFormData(prev => ({
//                 ...prev,
//                 states: stateList.filter(state => state !== "Select All"),
//             }));
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 states: [...new Set(newValue)],
//             }));
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (formData.roles.length === 0) {
//             setRoleError(true);
//             return;
//         }

//         const requiresStates = formData.roles.some(role =>
//             ["IT-RO_Staff" || "IT-RO_USER"].includes(role.role_name)
//         );

//         if (requiresStates && formData.states.length === 0) {
//             setSnackbarMessage("At least one state is required for IT-RO_Staff");
//             setSnackbarSeverity("error");
//             setSnackbarOpen(true);
//             return;
//         }

//         const finalFormData = {
//             emp_id: formData.emp_id,
//             roles: formData.roles.map(role => role.role_name),
//             states_assigned: formData.states.join(","), // Send as CSV string
//         };

//         try {
//             const response = await fetch(`${API_CONFIG.APIURL}/role/update`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(finalFormData),
//             });

//             if (!response.ok) {
//                 setSnackbarMessage("User Role Change failed!");
//                 setSnackbarSeverity("error");
//                 setSnackbarOpen(true);
//                 throw new Error(`Server Error: ${response.status}`);
//             }

//             setSnackbarMessage("User Role Changed Successfully!");
//             setSnackbarSeverity("success");
//             setSnackbarOpen(true);
//             setFormData({ emp_id: "", roles: [], states: [] });
//             navigate("/user_roles");
//         } catch (error) {
//         }
//     };

//     const handleReset = () => {
//         setFormData({ emp_id: "", roles: [], states: [] });
//     };

//     const requiresStates = formData.roles.some(role =>
//         ["IT-RO_Staff" || "IT-RO_USER"].includes(role.role_name)
//     );

//     return (
//         <>
//             <Navbar />
//             <Box
//                 sx={{
//                     padding: 4,
//                     mt: 8,
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                 }}
//             >
//                 <Paper
//                     elevation={4}
//                     sx={{
//                         p: 4,
//                         width: "100%",
//                         maxWidth: "800px",
//                         borderRadius: 3,
//                         backgroundColor: "#f9f9f9",
//                     }}
//                 >
//                     <Typography
//                         variant="h5"
//                         align="center"
//                         gutterBottom
//                         sx={{
//                             fontWeight: 600,
//                             color: "#0D47A1",
//                             textTransform: "uppercase",
//                             letterSpacing: 1,
//                             borderBottom: "2px solid #0D47A1",
//                             pb: 1,
//                         }}
//                     >
//                         User Role Change
//                     </Typography>

//                     <form onSubmit={handleSubmit}>
//                         <Grid container spacing={3} sx={{ mt: 1 }}>
//                             <Grid item xs={12} sm={6}>
//                                 <Autocomplete
//                                     options={employeeList}
//                                     getOptionLabel={(option) =>
//                                         `${option.emp_id} - ${option.emp_name}`
//                                     }
//                                     value={
//                                         employeeList.find(emp => emp.emp_id === formData.emp_id) ||
//                                         null
//                                     }
//                                     onChange={handleEmpChange}
//                                     isOptionEqualToValue={(option, value) =>
//                                         option.emp_id === value.emp_id
//                                     }
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="Employee ID / Name"
//                                             required
//                                             fullWidth
//                                         />
//                                     )}
//                                 />
//                             </Grid>

//                             <Grid item xs={12} sm={6}>
//                                 <Autocomplete
//                                     multiple
//                                     options={roleList}
//                                     getOptionLabel={(option) => option.role_name}
//                                     value={formData.roles}
//                                     onChange={handleRoleChange}
//                                     isOptionEqualToValue={(option, value) =>
//                                         option.role_name === value.role_name
//                                     }
//                                     renderInput={(params) => (
//                                         <TextField
//                                             {...params}
//                                             label="User Roles"
//                                             error={roleError}
//                                             helperText={
//                                                 roleError ? "Please select at least one role" : ""
//                                             }
//                                             fullWidth
//                                         />
//                                     )}
//                                 />
//                             </Grid>

//                             {requiresStates && (
//                                 <Grid item xs={12} sm={6}>
//                                     <Autocomplete
//                                         multiple
//                                         freeSolo
//                                         options={stateList}
//                                         value={formData.states}
//                                         onChange={handleStateChange}
//                                         renderInput={(params) => (
//                                             <TextField
//                                                 {...params}
//                                                 label="States"
//                                                 // required={requiresStates} // Only required when IT-RO_Staff is selected
//                                                 fullWidth
//                                             />
//                                         )}
//                                     />
//                                 </Grid>
//                             )}
//                         </Grid>

//                         <Box
//                             sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}
//                         >
//                             <Button
//                                 variant="outlined"
//                                 color="warning"
//                                 onClick={() => navigate(-1)}
//                             >
//                                 Back
//                             </Button>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 type="submit"
//                                 disabled={!formData.emp_id}
//                             >
//                                 Save
//                             </Button>
//                             <Button variant="outlined" color="error" onClick={handleReset}>
//                                 Reset
//                             </Button>
//                         </Box>
//                     </form>
//                 </Paper>
//             </Box>
//             <Snackbar
//                 open={snackbarOpen}
//                 autoHideDuration={4000}
//                 onClose={handleSnackbarClose}
//                 anchorOrigin={{ vertical: "top", horizontal: "center" }}
//             >
//                 <MuiAlert
//                     onClose={handleSnackbarClose}
//                     severity={snackbarSeverity}
//                     sx={{ width: "100%" }}
//                     elevation={6}
//                     variant="filled"
//                 >
//                     {snackbarMessage}
//                 </MuiAlert>
//             </Snackbar>
//         </>
//     );
// };

// export default RoleChange;


import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
    TextField,
    Button,
    Grid,
    Box,
    Typography,
    Autocomplete,
    Paper,
    Snackbar,
    Alert as MuiAlert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const { API_CONFIG } = require("../../configuration");

const RoleChange = ({ isDropped }) => {
    const navigate = useNavigate();

    const [employeeList, setEmployeeList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [stateList, setStateList] = useState([]);

    const [formData, setFormData] = useState({
        emp_id: "",
        roles: [],
        states: [],
    });

    const [roleError, setRoleError] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    const handleSnackbarClose = () => setSnackbarOpen(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [empRes, roleRes, stateRes] = await Promise.all([
                    axios.get(`${API_CONFIG.APIURL}/role/emp_idname`),
                    axios.get(`${API_CONFIG.APIURL}/role/list`),
                    axios.get(`${API_CONFIG.APIURL}/dashboard/distinct-states`),
                ]);

                setEmployeeList(empRes.data?.data || []);
                setRoleList(roleRes.data?.data || []);
                setStateList(["Select All", ...(stateRes.data || [])]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
            }
        };
        fetchInitialData();
    }, []);

    const handleEmpChange = (event, newValue) => {
        if (newValue) {
            const assignedIds = newValue.role_ids_assigned
                ?.split(",")
                .map((id) => parseInt(id.trim())) || [];

            const roles = roleList.filter((r) => assignedIds.includes(r.role_id));
            setFormData({
                emp_id: newValue.emp_id,
                roles,
                states: [],
            });
        } else {
            setFormData({ emp_id: "", roles: [], states: [] });
        }
    };

    const handleRoleChange = (event, newValue) => {
        setFormData((prev) => ({ ...prev, roles: newValue }));
        if (newValue.length > 0) setRoleError(false);
    };

    const handleStateChange = (event, newValue) => {
        if (newValue.includes("Select All")) {
            setFormData((prev) => ({
                ...prev,
                states: stateList.filter((s) => s !== "Select All"),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                states: [...new Set(newValue)],
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.roles.length === 0) {
            setRoleError(true);
            return;
        }

        const requiresStates = formData.roles.some((role) =>
            ["IT-RO_Staff", "IT-RO_USER"].includes(role.role_name)
        );

        if (requiresStates && formData.states.length === 0) {
            setSnackbarMessage("At least one state is required for IT-RO_Staff or IT-RO_USER");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const finalFormData = {
            emp_id: formData.emp_id,
            roles: formData.roles.map((r) => r.role_name),
            states_assigned: formData.states.join(","),
        };

        try {
            const response = await fetch(`${API_CONFIG.APIURL}/role/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalFormData),
            });

            if (!response.ok) {
                throw new Error("Failed to update role");
            }

            setSnackbarMessage("User Role Changed Successfully!");
            setSnackbarSeverity("success");
            setFormData({ emp_id: "", roles: [], states: [] });
            navigate("/user_roles");
        } catch (error) {
            console.error("Role update error:", error);
            setSnackbarMessage("User Role Change failed!");
            setSnackbarSeverity("error");
        } finally {
            setSnackbarOpen(true);
        }
    };

    const handleReset = () => setFormData({ emp_id: "", roles: [], states: [] });

    const showStates = formData.roles.some((role) =>
        ["IT-RO_Staff", "IT-RO_USER"].includes(role.role_name)
    );

    return (
        <>
            <Navbar />
            <Box sx={{ padding: 4, mt: 8, display: "flex", justifyContent: "center" }}>
                <Paper elevation={4} sx={{ p: 4, width: "100%", maxWidth: "800px", borderRadius: 3 }}>
                    <Typography
                        variant="h5"
                        align="center"
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: "#0D47A1",
                            textTransform: "uppercase",
                            borderBottom: "2px solid #0D47A1",
                            pb: 1,
                        }}
                    >
                        User Role Change
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={employeeList}
                                    getOptionLabel={(option) =>
                                        `${option.emp_id} - ${option.emp_name}`
                                    }
                                    value={
                                        employeeList.find(emp => emp.emp_id === formData.emp_id) || null
                                    }
                                    onChange={handleEmpChange}
                                    isOptionEqualToValue={(opt, val) =>
                                        opt.emp_id === val.emp_id
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Employee ID / Name" required fullWidth />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    multiple
                                    options={roleList}
                                    getOptionLabel={(option) => option.role_name}
                                    value={formData.roles}
                                    onChange={handleRoleChange}
                                    isOptionEqualToValue={(opt, val) =>
                                        opt.role_name === val.role_name
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="User Roles"
                                            error={roleError}
                                            helperText={roleError ? "Please select at least one role" : ""}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>

                            {showStates && (
                                <Grid item xs={12} sm={6}>
                                    <Autocomplete
                                        multiple
                                        options={stateList}
                                        value={formData.states}
                                        onChange={handleStateChange}
                                        renderInput={(params) => (
                                            <TextField {...params} label="States" fullWidth />
                                        )}
                                    />
                                </Grid>
                            )}
                        </Grid>

                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                            <Button variant="outlined" color="warning" onClick={() => navigate(-1)}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={!formData.emp_id}
                            >
                                Save
                            </Button>
                            <Button variant="outlined" color="error" onClick={handleReset}>
                                Reset
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <MuiAlert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbarMessage}
                </MuiAlert>
            </Snackbar>
        </>
    );
};

export default RoleChange;
