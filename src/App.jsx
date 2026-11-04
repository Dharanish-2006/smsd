import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import AlertsPage from "./pages/AlertsPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProcessPage from "./pages/ProcessPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
export default function App() {
    return (<AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login"/>}/>
        <Route path="/register" element={<AuthPage mode="register"/>}/>
        <Route element={<DataProvider>
              <Layout />
            </DataProvider>}>
          <Route index element={<DashboardPage />}/>
          <Route path="machines" element={<Navigate to="/machines/sheller-1" replace/>}/>
          <Route path="machines/:id" element={<ProcessPage />}/>
          <Route path="alerts" element={<AlertsPage />}/>
          <Route path="reports" element={<ReportsPage />}/>
          <Route path="settings" element={<SettingsPage />}/>
        </Route>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </AuthProvider>);
}
