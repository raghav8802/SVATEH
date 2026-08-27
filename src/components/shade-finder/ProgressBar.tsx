const STEPS = 4;

export function ProgressBar({ step }: { step: number }) {
  const value = Math.round((step / STEPS) * 100);

  return (
    <div
      className="mx-auto h-1.5 w-full max-w-md overflow-hidden rounded-full bg-[#E9DDCF]"
      role="progressbar"
      aria-label="Shade finder progress"
      aria-valuemin={1}
      aria-valuemax={STEPS}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${STEPS}`}
    >
      <div
        className="h-full rounded-full bg-svateh-espresso transition-all duration-500 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
