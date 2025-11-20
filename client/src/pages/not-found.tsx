import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      <Card className="w-full max-w-md athletic-card" data-testid="card-not-found">
        <CardContent className="pt-8 pb-8">
          <div className="flex mb-6 gap-3 items-center">
            <AlertCircle className="h-10 w-10 text-destructive" data-testid="icon-alert" />
            <h1 className="text-3xl font-black uppercase tracking-tight" data-testid="text-error-title">404 Not Found</h1>
          </div>

          <p className="mt-4 text-base text-muted-foreground" data-testid="text-error-message">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
