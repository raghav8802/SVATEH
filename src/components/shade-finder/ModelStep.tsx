import Image from "next/image";
import { MODELS_BY_TONE, type FaceModel, type SkinTone } from "@/lib/shadeFinder";

type ModelStepProps = {
  tone: SkinTone;
  onSelect: (model: FaceModel) => void;
};

export function ModelStep({ tone, onSelect }: ModelStepProps) {
  const models = MODELS_BY_TONE[tone];

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="font-serif text-3xl font-medium lowercase text-svateh-espresso sm:text-4xl">
        pick the model closest to you
      </h1>
      <p className="mt-3 text-sm text-svateh-mocha sm:text-base">
        choose the face that looks most like yours today.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
        {models.map((model) => (
          <button
            key={model.id}
            type="button"
            onClick={() => onSelect(model)}
            aria-label={model.alt}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#E9DDCF] shadow-luxury transition-all hover:-translate-y-0.5 hover:border-svateh-gold hover:shadow-luxury-lg"
          >
            <Image
              src={model.image}
              alt={model.alt}
              fill
              className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 320px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
