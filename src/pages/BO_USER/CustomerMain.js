// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//     Stack, Box, TextField, MenuItem, Button, Typography
// } from "@mui/material";
// import { useNavigate, useLocation } from "react-router-dom";
// import Navbar from "../Navbar";
// import { API_CONFIG } from '../../configuration';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import dayjs from 'dayjs';

// const CustomerMain = () => {
//     const location = useLocation();
//     const passedDocketId = location.state?.instakit_no || "";

//     const [formData, setFormData] = useState({
//         customer_id: "",
//         loan_app_no: "",
//         docket_id: passedDocketId,
//         issue_date: ""
//     });

//     const [instakitOptions, setInstakitOptions] = useState([]);
//     const [isFormValid, setIsFormValid] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         axios.get(`${API_CONFIG.APIURL}//bos/instakits`)
//             .then((res) => {
//                 setInstakitOptions(res.data);
//             })
//             .catch((err) => {
//                 console.error("Error fetching docket IDs", err);
//             });
//     }, []);

//     useEffect(() => {
//         const { customer_id, loan_app_no, docket_id, issue_date } = formData;
//         setIsFormValid(customer_id && loan_app_no && docket_id && issue_date);
//     }, [formData]);

//     const handleChange = (field) => (e) => {
//         setFormData({ ...formData, [field]: e.target.value });
//     };

//     const handleBack = async () => {
//         navigate('/bo-user/boassign')
//     }

//     const handleSubmit = async () => {
//         try {
//             const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
//             const payload = {
//                 customerID: formData.customer_id,
//                 loanApplicationNo: formData.loan_app_no,
//                 instakitNo: formData.docket_id,
//                 issuedDate: formData.issue_date,
//                 requestedBy: loggedInUser.emp_id || "SYSTEM",
//             };

//             const response = await axios.post(`${API_CONFIG.APIURL}/bo/createcustomer`, payload);
//             if (response.ok) {
//                 alert(response.data.message);
//                 navigate("/bo-user/boassign");
//             } else {
//                 alert(`${response.data.message}` || "Assignment failed.");
//                 navigate("/bo-user/boassign");
//             }
//         } catch (error) {
//             console.error("Assignment error:", error);
//             if (error.response && error.response.data && error.response.data.message) {
//                 alert(`${error.response.data.message}`);
//             } else if (error.message) {
//                 alert(` ${error.message}`);
//             } else {
//                 alert("❌ Assignment failed due to an unknown error.");
//             }
//         }
//     };


//     return (
//         <>
//             <Navbar />

//             <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
//                 <Typography variant="h5" gutterBottom>
//                     Customer Assign Details
//                 </Typography>

//                 <TextField
//                     label="InstaKit No."
//                     fullWidth
//                     margin="normal"
//                     value={formData.docket_id}
//                     disabled
//                 />
//                 <TextField
//                     label="Customer ID"
//                     fullWidth
//                     margin="normal"
//                     value={formData.customer_id}
//                     onChange={handleChange("customer_id")}
//                 />

//                 <TextField
//                     label="Loan Application ID"
//                     fullWidth
//                     margin="normal"
//                     value={formData.loan_app_no}
//                     onChange={handleChange("loan_app_no")}
//                 />

//                 <LocalizationProvider dateAdapter={AdapterDayjs}>
//                     <DatePicker
//                         label="Issue Date"
//                         format="DD-MM-YYYY"
//                         value={formData.issue_date ? dayjs(formData.issue_date) : null}
//                         onChange={(date) => {
//                             setFormData({ ...formData, issue_date: date.format('YYYY-MM-DD') }); // store as ISO for backend
//                         }}
//                         InputLabelProps={{ shrink: true }}
//                         slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
//                     />
//                 </LocalizationProvider>

//                 <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
//                     <Button
//                         variant="contained"
//                         color="warning"
//                         fullWidth
//                         onClick={handleBack}
//                     >
//                         Back
//                     </Button>
//                     <Button
//                         variant="contained"
//                         color="primary"
//                         fullWidth
//                         disabled={!isFormValid}
//                         onClick={handleSubmit}
//                     >
//                         Submit
//                     </Button>
//                 </Stack>
//             </Box >
//         </>
//     );
// };

// export default CustomerMain;






import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Stack, Box, TextField, Button, Typography
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import { API_CONFIG } from '../../configuration';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const CustomerMain = () => {
    const location = useLocation();
    const passedDocketId = location.state?.instakit_no || "";
    const today = dayjs();
    const [formData, setFormData] = useState({
        customer_id: "",
        loan_app_no: "",
        docket_id: passedDocketId,
        issue_date: today
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_CONFIG.APIURL}/bos/instakits`)
            .then((res) => {
                // If you need instakitOptions later, you can use this
                // setInstakitOptions(res.data);
            })
            .catch((err) => {
                console.error("Error fetching docket IDs", err);
            });
    }, []);

    useEffect(() => {
        const { customer_id, loan_app_no, docket_id, issue_date } = formData;
        setIsFormValid(customer_id && loan_app_no && docket_id && issue_date);
    }, [formData]);

    const handleChange = (field) => (e) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleBack = () => {
        navigate('/bo-user/boassign');
    };

    const handleSubmit = async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
            const payload = {
                customerID: formData.customer_id,
                loanApplicationNo: formData.loan_app_no,
                instakitNo: formData.docket_id,
                issuedDate: formData.issue_date, // backend receives YYYY-MM-DD
                requestedBy: loggedInUser.emp_id || "SYSTEM",
            };

            const response = await axios.post(`${API_CONFIG.APIURL}/bo/createcustomer`, payload);
            if (response.status === 200) {
                alert(response.data.message);
                navigate("/bo-user/boassign");
            } else {
                alert(response.data.message || "Assignment failed.");
            }
        } catch (error) {
            console.error("Assignment error:", error);
            const msg = error.response?.data?.message || error.message || "❌ Assignment failed due to an unknown error.";
            alert(msg);
        }
    };

    return (
        <>
            <Navbar />

            <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
                <Typography variant="h5" gutterBottom>
                    Customer Assign Details
                </Typography>

                <TextField
                    label="InstaKit No."
                    fullWidth
                    margin="normal"
                    value={formData.docket_id}
                    disabled
                />
                <TextField
                    label="Customer ID"
                    fullWidth
                    margin="normal"
                    value={formData.customer_id}
                    onChange={handleChange("customer_id")}
                />
                <TextField
                    label="Loan Application ID"
                    fullWidth
                    margin="normal"
                    value={formData.loan_app_no}
                    onChange={handleChange("loan_app_no")}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Issue Date (DD-MM-YYYY)"
                        format="DD-MM-YYYY"
                        value={formData.issue_date ? dayjs(formData.issue_date) : null}
                        onChange={(date) => {
                            setFormData({ ...formData, issue_date: date.format('YYYY-MM-DD') });
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                margin: 'normal'
                            }
                        }}
                    />
                </LocalizationProvider>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="warning"
                        fullWidth
                        onClick={handleBack}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={!isFormValid}
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Stack>
            </Box>
        </>
    );
};

export default CustomerMain;
