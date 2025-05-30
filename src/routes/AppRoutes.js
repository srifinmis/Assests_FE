import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import Dashboardmain from "../DashBoardmain";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPass from "../pages/Reset_Pass";
import DashBoard from "../pages/DashBoard";
import AssetList from "../pages/assetlist";
import AssignAsset from "../pages/AssignAsset";
import FreeAsset from "../pages/FreeAsset";
import MaintenanceAsset from "../pages/Maintenance";
import Dashboardreports from "../Components/Dashboardreports";

// Approvals
import AssignApproval from "../pages/Approval/Assigned";
import MaintenanceApproval from "../pages/Approval/UnderMaintenance";
import FreePoolApproval from "../pages/Approval/FreePool";
import POApproval from "../pages/Approval/PurchaseOrder";
import InvoiceApproval from "../pages/Approval/Invoice";
import PaymentApproval from "../pages/Approval/Payment";
import BulkApproval from "../pages/Approval/bulk_upload"

// New Asset
import POMain from "../pages/New_Asset/POMain";
import InvoiceMain from "../pages/New_Asset/InvoiceMain"
import CreatePO from "../pages/New_Asset/Create_PO";
import EditPO from "../pages/New_Asset/Edit_PO";
import UploadInvoice from "../pages/New_Asset/Upload_Invoice";
import UploadReciept from "../pages/New_Asset/Upload_Reciept";
import AssetDepreciation from "../pages/New_Asset/AssetDepreciation";

//bulk upload
import BulkUpload from "../pages/BulkUpload"
import RoleBase from "../pages/RoleBase/RoleBasedaccessmain"

// Reports
import BorrowerMasterReport from "../Components/BorrowMasterReport";
import CreditReport from "../Components/CreditReport";
import DeathReport from "../Components/DeathReport";
import EmployeeMasterReport from "../Components/EmployeeMasterReport";
import LoanApplicationReport from "../Components/LoanApplicationReport";
import ForeclosureReport from "../Components/ForeClouserReport";
import LoanDetailsReport from "../Components/LoanDetailsReport";
import LUCReport from "../Components/LUCReport";

// CIC
import CICReports from "../Components/Reports";
import CICReupload from "../Components/Reupload";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return isLoggedIn ? children : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPass />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                {/* Dashboard and Asset Management */}
                <Route path="/DashBoardmain" element={<Dashboardmain />} />
                <Route path="/components/dashboardreports" element={<Dashboardreports />} />
                <Route path="/DashBoard" element={<DashBoard />} />
                <Route path="/:category/:type" element={<AssetList />} />
                <Route path="/assign-asset/:encodedAssetId" element={<AssignAsset />} />
                <Route path="/free-asset/:encodedAssetId" element={<FreeAsset />} />
                <Route path="/undermaintenance-asset/:encodedAssetId" element={<MaintenanceAsset />} />

                {/* Approval Routes */}
                <Route path="/approval/assigned" element={<AssignApproval />} />
                <Route path="/approval/under-maintenance" element={<MaintenanceApproval />} />
                <Route path="/approval/free-pool" element={<FreePoolApproval />} />
                <Route path="/approval/po" element={<POApproval />} />
                <Route path="/approval/invoice" element={<InvoiceApproval />} />
                <Route path="/approval/payment" element={<PaymentApproval />} />
                <Route path="/approval/bulk" element={<BulkApproval />} />

                {/* New Asset Routes */}
                <Route path="/new-assets/purchase-order" element={<POMain />} />
                <Route path="/new-assets/invoice" element={<InvoiceMain />} />
                <Route path="/new-assets/create-po" element={<CreatePO />} />
                <Route path="/new-assets/edit-po/:po_number" element={<EditPO />} />
                <Route path="/new-assets/upload-invoice" element={<UploadInvoice />} />
                <Route path="/new-assets/upload-reciept" element={<UploadReciept />} />
                <Route path="/new-assets/assetdepreciation" element={<AssetDepreciation />} />

                {/* BulkUpload and RoleBase Routes */}
                <Route path="/BulkUpload" element={<BulkUpload />} />
                <Route path="/user_roles" element={<RoleBase />} />

                {/* Reports Routes */}
                <Route path="/components/BorrowMasterReport" element={<BorrowerMasterReport />} />
                <Route path="/components/CreditReport" element={<CreditReport />} />
                <Route path="/components/DeathReport" element={<DeathReport />} />
                <Route path="/components/EmployeeMasterReport" element={<EmployeeMasterReport />} />
                <Route path="/components/LoanApplicationReport" element={<LoanApplicationReport />} />
                <Route path="/components/ForeClouserReport" element={<ForeclosureReport />} />
                <Route path="/components/LoanDetailsReport" element={<LoanDetailsReport />} />
                <Route path="/components/LUCReport" element={<LUCReport />} />


                {/* CIC Routes */}
                <Route path="/components/Reports" element={<CICReports />} />
                <Route path="/components/Reupload" element={<CICReupload />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
