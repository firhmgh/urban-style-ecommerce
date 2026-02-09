// import { useAuth } from "@/lib/auth-context";
// import { Navigate } from "react-router";

// export default function ProtectedRoute({ 
//   children, 
//   requireAdmin = false 
// }: { 
//   children: React.ReactNode, 
//   requireAdmin?: boolean 
// }) {
//   const { user, role, loading } = useAuth();

//   if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (requireAdmin && role !== 'admin') {
//     return <Navigate to="/home" replace />;
//   }

//   return <>{children}</>;
// }   