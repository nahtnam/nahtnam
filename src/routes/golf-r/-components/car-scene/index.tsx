import { lazy, Suspense, useEffect, useState } from "react";

const CarSceneInner = lazy(async () => {
  const m = await import("./scene");
  return { default: m.CarSceneInner };
});

export function CarScene() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center md:h-[400px]">
        <div className="font-mono text-sm text-white/20">Loading...</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-[350px] w-full items-center justify-center md:h-[400px]">
          <div className="font-mono text-sm text-white/20">
            Loading 3D model...
          </div>
        </div>
      }
    >
      <CarSceneInner />
    </Suspense>
  );
}
