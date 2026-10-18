"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-plum !py-2.5">
      Print
    </button>
  );
}
