type UndertoneStepProps = {
  value: number;
  olive: boolean;
  onChange: (value: number) => void;
  onOliveChange: (olive: boolean) => void;
  onNext: () => void;
};

export function UndertoneStep({
  value,
  olive,
  onChange,
  onOliveChange,
  onNext,
}: UndertoneStepProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-serif text-3xl font-medium lowercase text-svateh-espresso sm:text-4xl">
        undertones are a spectrum
      </h1>
      <p className="mt-3 text-sm text-svateh-mocha sm:text-base">
        we consider your undertone, not just your skin tone
      </p>

      <div className="mt-14 px-2 sm:px-6">
        <label htmlFor="undertone-slider" className="sr-only">
          Undertone from cool to warm
        </label>
        <input
          id="undertone-slider"
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="undertone-slider w-full"
        />

        <div className="mt-5 grid grid-cols-3 text-svateh-espresso">
          <div className="text-left">
            <p className="text-sm font-semibold lowercase">cool</p>
            <p className="mt-0.5 text-xs text-svateh-mocha">veins are blue</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold lowercase">neutral</p>
            <p className="mt-0.5 text-xs text-svateh-mocha">mix of green &amp; blue</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold lowercase">warm</p>
            <p className="mt-0.5 text-xs text-svateh-mocha">veins are green</p>
          </div>
        </div>

        <label className="mt-8 inline-flex cursor-pointer items-center justify-center gap-2.5 text-sm text-svateh-espresso">
          <input
            type="checkbox"
            checked={olive}
            onChange={(e) => onOliveChange(e.target.checked)}
            className="h-4 w-4 rounded border-[#E9DDCF] text-svateh-espresso accent-svateh-espresso"
          />
          <span className="lowercase">i am an olive</span>
        </label>
      </div>

      <div className="mt-12 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-svateh-espresso px-8 py-3 font-serif text-lg lowercase tracking-wide text-white transition-opacity hover:opacity-90"
        >
          next
        </button>
      </div>
    </div>
  );
}
