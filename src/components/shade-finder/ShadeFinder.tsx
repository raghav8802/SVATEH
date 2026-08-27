"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  matchShade,
  type FaceModel,
  type SkinTone,
} from "@/lib/shadeFinder";
import { ModelStep } from "./ModelStep";
import { ProgressBar } from "./ProgressBar";
import { ResultStep } from "./ResultStep";
import { SkinToneStep } from "./SkinToneStep";
import { UndertoneStep } from "./UndertoneStep";

const fade = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function ShadeFinder() {
  const [step, setStep] = useState(1);
  const [tone, setTone] = useState<SkinTone | null>(null);
  const [slider, setSlider] = useState(50);
  const [olive, setOlive] = useState(false);

  const match = useMemo(
    () => (tone ? matchShade(tone, slider, olive) : null),
    [tone, slider, olive]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleTone = (next: SkinTone) => {
    setTone(next);
    setOlive(false);
    setSlider(50);
    setStep(2);
  };

  const handleModel = (model: FaceModel) => {
    setSlider(model.undertoneHint);
    setStep(3);
  };

  const restart = () => {
    setStep(1);
    setTone(null);
    setSlider(50);
    setOlive(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
      <p className="mb-6 text-center font-serif text-sm tracking-wide text-svateh-gold sm:text-base">
        find your foundation shade in under 30 seconds
      </p>

      <ProgressBar step={step} />

      {step > 1 && step < 4 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={goBack}
            className="text-xs uppercase tracking-widest text-svateh-mocha transition-colors hover:text-svateh-gold"
          >
            Back
          </button>
        </div>
      )}

      <div className="mt-8 min-h-[28rem]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step-1" {...fade} transition={{ duration: 0.25 }}>
              <SkinToneStep onSelect={handleTone} />
            </motion.div>
          )}
          {step === 2 && tone && (
            <motion.div key="step-2" {...fade} transition={{ duration: 0.25 }}>
              <ModelStep tone={tone} onSelect={handleModel} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step-3" {...fade} transition={{ duration: 0.25 }}>
              <UndertoneStep
                value={slider}
                olive={olive}
                onChange={setSlider}
                onOliveChange={setOlive}
                onNext={() => setStep(4)}
              />
            </motion.div>
          )}
          {step === 4 && match && (
            <motion.div key="step-4" {...fade} transition={{ duration: 0.25 }}>
              <ResultStep match={match} onRestart={restart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
