import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessDenied = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        
        <h1 className="font-serif text-3xl font-semibold mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have permission to view this page. This area may require admin privileges or a different user role.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Go to Home
            </Link>
          </Button>
          <Button asChild>
            <Link to="/login">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          If you believe this is an error, please{" "}
          <Link to="/help" className="text-primary hover:underline">contact support</Link>.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
