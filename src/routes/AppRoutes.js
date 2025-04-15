// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import Login from "../pages/Login";
// import ForgotPassword from "../pages/ForgotPassword";
// import DashBoard from "../pages/DashBoard";
// import AssetList from "../pages/assetlist";
// import AssignAsset from "../pages/AssignAsset";
// import FreeAsset from "../pages/FreeAsset";
// import MaintenanceAsset from "../pages/Maintenance";

// //approvals
// import AssignApproval from "../pages/Approval/Assigned";
// import MaintenanceApproval from "../pages/Approval/UnderMaintenance";
// import FreePoolApproval from "../pages/Approval/FreePool";
// import POApproval from "../pages/Approval/PurchaseOrder";
// import InvoiceApproval from "../pages/Approval/Invoice"
// import PaymentApproval from "../pages/Approval/Payment"

// //new asset
// import CreatePO from "../pages/New_Asset/Create_PO";
// import UploadInvoice from "../pages/New_Asset/Upload_Invoice";
// import UploadReciept from "../pages/New_Asset/Upload_Reciept";
// import CreateAsset from "../pages/New_Asset/Create_New_Asset";
// import NewAsset from "../pages/New_Asset/New_Asset";

// const ProtectedRoute = ({ children }) => {
//   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
//   return isLoggedIn ? children : <Navigate to="/" />;
// };

// const AppRoutes = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/" element={<Login />} />
//         <Route path="/ForgotPassword" element={<ForgotPassword />} />

//         {/* Protected Routes */}
//         <Route
//           path="/*"
//           element={
//             <ProtectedRoute>
//               <Routes>
//                 <Route path="/DashBoard" element={<DashBoard />} />
//                 <Route path="/:category/:type" element={<AssetList />} />
//                 <Route path="/assign-asset/:assetId" element={<AssignAsset />} />
//                 <Route path="/free-asset/:assetId" element={<FreeAsset />} />
//                 <Route path="/undermaintenance-asset/:assetId" element={<MaintenanceAsset />} />



//                 {/* <Route path="/approval/free-pool" element={<FreePoolApproval />} /> */}
//                 <Route path="/approval/assigned" element={<AssignApproval />} /> 
//                 <Route path="/approval/under-maintenance" element={<MaintenanceApproval />} /> 
//                 <Route path="/approval/free-pool" element={<FreePoolApproval />} /> 
//                 <Route path="/approval/po" element={<POApproval />} /> 
//                 <Route path="/approval/invoice" element={<InvoiceApproval />} /> 
//                 <Route path="/approval/payment" element={<PaymentApproval />} /> 
                
//                 <Route path="/new-assets/create-po" element={<CreatePO />} />
//                 <Route path="/new-assets/upload-invoice" element={<UploadInvoice />} />
//                 <Route path="/new-assets/upload-reciept" element={<UploadReciept />} />
//                 <Route path="/new-assets/create-new-asset" element={<CreateAsset />} />
//                 <Route path="/new-assets/new-asset" element={<NewAsset />} />

//               </Routes>
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </Router>
//   );
// };

// export default AppRoutes;
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import DashBoard from "../pages/DashBoard";
import AssetList from "../pages/assetlist";
import AssignAsset from "../pages/AssignAsset";
import FreeAsset from "../pages/FreeAsset";
import MaintenanceAsset from "../pages/Maintenance";

// Approvals
import AssignApproval from "../pages/Approval/Assigned";
import MaintenanceApproval from "../pages/Approval/UnderMaintenance";
import FreePoolApproval from "../pages/Approval/FreePool";
import POApproval from "../pages/Approval/PurchaseOrder";
import InvoiceApproval from "../pages/Approval/Invoice";
import PaymentApproval from "../pages/Approval/Payment";

// New Asset
import CreatePO from "../pages/New_Asset/Create_PO";
import UploadInvoice from "../pages/New_Asset/Upload_Invoice";
import UploadReciept from "../pages/New_Asset/Upload_Reciept";
import CreateAsset from "../pages/New_Asset/Create_New_Asset";
import NewAsset from "../pages/New_Asset/New_Asset";

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

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                {/* Dashboard and Asset Management */}
                <Route path="/DashBoard" element={<DashBoard />} />
                <Route path="/:category/:type" element={<AssetList />} />
                <Route path="/assign-asset/:assetId" element={<AssignAsset />} />
                <Route path="/free-asset/:assetId" element={<FreeAsset />} />
                <Route path="/undermaintenance-asset/:assetId" element={<MaintenanceAsset />} />

                {/* Approval Routes */}
                <Route path="/approval/assigned" element={<AssignApproval />} />
                <Route path="/approval/under-maintenance" element={<MaintenanceApproval />} />
                <Route path="/approval/free-pool" element={<FreePoolApproval />} />
                <Route path="/approval/po" element={<POApproval />} />
                <Route path="/approval/invoice" element={<InvoiceApproval />} />
                <Route path="/approval/payment" element={<PaymentApproval />} />

                {/* New Asset Routes */}
                <Route path="/new-assets/create-po" element={<CreatePO />} />
                <Route path="/new-assets/upload-invoice" element={<UploadInvoice />} />
                <Route path="/new-assets/upload-reciept" element={<UploadReciept />} />
                <Route path="/new-assets/create-new-asset" element={<CreateAsset />} />
                <Route path="/new-assets/new-asset" element={<NewAsset />} />

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
