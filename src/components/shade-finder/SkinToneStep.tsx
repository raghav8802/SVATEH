import Image from "next/image";
import { SKIN_TONES, type SkinTone } from "@/lib/shadeFinder";

type SkinToneStepProps = {
  onSelect: (tone: SkinTone) => void;
};

export function SkinToneStep({ onSelect }: SkinToneStepProps) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="font-serif text-3xl font-medium lowercase text-svateh-espresso sm:text-4xl">
        pick the skin tone closest to yours
      </h1>
      <p className="mt-3 text-sm text-svateh-mocha sm:text-base">
        don&apos;t overthink it, just pick the closest match.
      </p>

      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
        {SKIN_TONES.map((tone) => (
          <ToneCard key={tone.id} tone={tone} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function ToneCard({
  tone,
  onSelect,
}: {
  tone: (typeof SKIN_TONES)[number];
  onSelect: (tone: SkinTone) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tone.id)}
      className="group overflow-hidden rounded-2xl border border-[#E9DDCF] bg-white text-left shadow-luxury transition-all hover:-translate-y-0.5 hover:border-svateh-gold hover:shadow-luxury-lg"
    >
      <span className="relative block aspect-[5/4] overflow-hidden">
        <span className="absolute inset-0 grid grid-cols-4">
          {tone.images.map((src) => (
            <span key={src} className="relative">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 15vw, 180px"
              />
            </span>
          ))}
        </span>
      </span>
      <span className="block bg-white py-3 text-center font-sans text-sm lowercase text-svateh-espresso sm:py-4 sm:text-base">
        {tone.label}
      </span>
    </button>
  );
}
