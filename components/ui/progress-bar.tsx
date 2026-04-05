export function ProgressBar({ progress }: { progress: number }) {
  // progress should be between 0 and 1
  const percent = Math.min(Math.max(progress, 0), 1) * 100;
  
  return (
    <div className="w-full bg-[#37464F] rounded-full h-4 overflow-hidden">
      <div 
        className="bg-primary h-full transition-all duration-500 ease-out" 
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
