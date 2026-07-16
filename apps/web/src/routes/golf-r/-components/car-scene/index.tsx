import { lazy, Suspense, useSyncExternalStore } from "react";

const CarSceneInner = lazy(async () => {
  const module = await import("./scene");

  return { default: module.CarSceneInner };
});

export function CarScene() {
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!isClient) {
    return <CarSceneLoading label="Loading vehicle model" />;
  }

  return (
    <Suspense fallback={<CarSceneLoading label="Loading 3D model" />}>
      <CarSceneInner />
    </Suspense>
  );
}

type CarSceneLoadingProps = {
  label: string;
};

function CarSceneLoading(props: CarSceneLoadingProps) {
  const { label } = props;

  return (
    <output
      aria-label={label}
      className="flex h-[320px] w-full items-center justify-center md:h-[390px]"
    >
      <span className="loading loading-spinner loading-lg text-base-content/35" />
    </output>
  );
}

function subscribeToNothing() {
  return () => {
    // Client detection does not subscribe to an external store.
  };
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}
