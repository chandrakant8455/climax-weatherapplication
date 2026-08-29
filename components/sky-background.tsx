export function SkyBackground({ background }: { background: string }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base sky gradient (transitions when weather changes) */}
      <div
        className="absolute inset-0 transition-[background] duration-1000 ease-out"
        style={{ background }}
      />
      {/* Soft aurora glows for the liquid-glass depth */}
      <div
        className="absolute -left-1/4 top-[-15%] size-[70vh] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.85 0.14 220), transparent 65%)",
          animation: "aurora-drift 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-1/4 top-1/3 size-[60vh] rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.8 0.13 320), transparent 65%)",
          animation: "aurora-drift-2 22s ease-in-out infinite",
        }}
      />
      {/* Fine grain to break up banding */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay [background-image:radial-gradient(oklch(1_0_0/0.4)_0.5px,transparent_0.5px)] [background-size:3px_3px]" />
    </div>
  )
}
