//src/pages/Create_New_Asset.js
import React, { useState } from "react";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
} from "@mui/material";

const CreateAsset = () => {
  const [withReceipt, setWithReceipt] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const navigate = useNavigate();

  const handleCheckboxChange = (option) => {
    setWithReceipt(option);
  };

  const handleFileChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleSubmit = () => {
    if (withReceipt && (!utrNumber || !pdfFile)) {
      alert("Please enter UTR number and upload PDF file.");
      return;
    }
    // Perform any necessary file upload handling here
    navigate("/new-assets/new-asset");
  };

  return (
    <>
    <Navbar/>
    
    <Box sx={{ maxWidth: 500, margin: "auto", mt: 5, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create New Asset
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={withReceipt === true} onChange={() => handleCheckboxChange(true)} />}
        label="You want to create with payment receipt"
      />
      <FormControlLabel
        control={<Checkbox checked={withReceipt === false} onChange={() => handleCheckboxChange(false)} />}
        label="You want to create without payment receipt"
      />

      {withReceipt && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="UTR Number"
            variant="outlined"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            sx={{ mb: 2 }}
          />
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </Box>
      )}

      <Button variant="contained" color="primary" sx={{ mt: 3 }} fullWidth onClick={handleSubmit}>
        Proceed to New Asset Creation
      </Button>
    </Box>
    </>
  );
};

export default CreateAsset;