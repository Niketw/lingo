import { cn } from "./button"

export function MetricCard({ 
  icon, 
  value, 
  label, 
  className 
}: { 
  icon: string, 
  value: string | number, 
  label: string, 
  className?: string 
}) {
  return (
    <div className={cn("bg-card p-4 rounded-2xl border-2 border-border text-center shadow-md", className)}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-extrabold">{value}</div>
      <div className="text-sm font-bold text-gray-400">{label}</div>
    </div>
  )
}
