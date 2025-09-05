import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (!loading && requireAdmin && user && !isAdmin && !notifiedRef.current) {
      toast({
        title: "Brak uprawnień",
        description: "Nie masz uprawnień administratora.",
        variant: "destructive",
      });
      notifiedRef.current = true;
    }
  }, [loading, requireAdmin, user, isAdmin, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};