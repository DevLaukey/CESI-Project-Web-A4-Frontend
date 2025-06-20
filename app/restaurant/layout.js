import Header from "@/components/restaurant/Header";
import ProtectedDashboardLayout from "./ProtectedDashboardLayout";

export default function Layout({ children }) {
  return (
    <ProtectedDashboardLayout>
      {children}
    </ProtectedDashboardLayout>
  );
}
