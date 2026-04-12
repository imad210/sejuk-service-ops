import { createBrowserRouter } from "react-router-dom";
import { AdminOrderPage } from "./pages/AdminOrderPage";
import { HomePage } from "./pages/HomePage";
import { TechnicianJobDetailPage } from "./pages/TechnicianJobDetailPage";
import { TechnicianJobsPage } from "./pages/TechnicianJobsPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/admin/orders/new", element: <AdminOrderPage /> },
  { path: "/technician/jobs", element: <TechnicianJobsPage /> },
  { path: "/technician/jobs/:orderId", element: <TechnicianJobDetailPage /> },
]);
