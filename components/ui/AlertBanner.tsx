import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AlertType = "error" | "warning" | "success" | "info";

type AlertBannerProps = {
  type: AlertType;
  message: string;
};

const mapStyles: Record<AlertType, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

export function AlertBanner({ type, message }: AlertBannerProps) {
  return (
    <Alert className={mapStyles[type]}>
      <AlertTitle>{type.toUpperCase()}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
