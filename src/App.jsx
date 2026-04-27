import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { BrandProvider } from "./context/BrandContext";

// Public Pages
import Home from "./pages/Home";
import Doctor from "./pages/Doctor";
import Emergency from "./pages/Emergency";
import Bus from "./pages/Bus";
import Ferry from "./pages/Ferry";
import Events from "./pages/Events";
import BloodDonation from "./pages/BloodDonation";
import PublicBloodCampDetail from "./pages/PublicBloodCampDetail";
import BirthdayPopup from "./components/BirthdayPopup";

// Admin Pages
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import UsersPage from "./admin/pages/UsersPage";
import BusPage from "./admin/pages/BusPage";
import FerryPage from "./admin/pages/FerryPage";
import DoctorsPage from "./admin/pages/DoctorsPage";
import EmergencyPage from "./admin/pages/EmergencyPage";
import EventsPage from "./admin/pages/EventsPage";
import AdsPage from "./admin/pages/AdsPage";
import AnalyticsPage from "./admin/pages/AnalyticsPage";
import SettingsPage from "./admin/pages/SettingsPage";
import BloodDonationPage from "./admin/pages/BloodDonationPage";
import AdminBloodCampDetail from "./admin/pages/AdminBloodCampDetail";
import DDocs from "./admin/pages/DDocs";
import ProtectedRoute, {
  AdminRoute,
  NonMemberRoute,
} from "./protectedroute/ProtectedRoute";
import { Toaster } from "sonner";
import PublicLayout from "./pages/layout/HomeLayout";
import AuditLogs from "./admin/pages/AuditLogs";
import AuditLogDetail from "./admin/pages/AuditLogDetail";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <ThemeProvider>
      <BrandProvider>
        <LanguageProvider>
          <AuthProvider>
            <ScrollToTop />
            <BirthdayPopup />
            <Toaster
              position="top-right"
              // expand={true}
              richColors
              duration={3000}
            />
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route
                    path="users"
                    element={
                      <AdminRoute>
                        <UsersPage />
                      </AdminRoute>
                    }
                  />
                  <Route path="bus" element={<BusPage />} />
                  <Route path="ferry" element={<FerryPage />} />
                  <Route path="doctors" element={<DoctorsPage />} />
                  <Route path="emergency" element={<EmergencyPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="advertisements" element={<AdsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />}>
                    <Route path="auditlogs" element={<AuditLogs />} />
                    <Route path="auditlogs/:id" element={<AuditLogDetail />} />
                  </Route>

                  <Route
                    path="settings"
                    element={
                      <AdminRoute>
                        <SettingsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="blood-donation"
                    element={<BloodDonationPage />}
                  />
                  <Route
                    path="blood-donation/:id"
                    element={<AdminBloodCampDetail />}
                  />
                </Route>
                <Route
                  path="/admin/docs"
                  element={
                    <AdminRoute>
                      <DDocs />
                    </AdminRoute>
                  }
                />
              </Route>

              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="doctor" element={<Doctor />} />
                <Route path="emergency" element={<Emergency />} />
                <Route path="bus" element={<Bus />} />
                <Route path="ferry" element={<Ferry />} />
                <Route path="events" element={<Events />} />
                <Route path="blood-donation" element={<BloodDonation />} />
                <Route path="blood-donation/:id" element={<PublicBloodCampDetail />} />
              </Route>
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrandProvider>
    </ThemeProvider>
  );
}

export default App;
