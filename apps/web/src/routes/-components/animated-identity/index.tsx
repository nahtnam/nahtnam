import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { slotText } from "slot-text";
import type { SlotTextController } from "slot-text";

import "slot-text/style.css";

const identities = ["manthan", "@nahtnam"] as const;
const [primaryIdentity, secondaryIdentity] = identities;
const identityChangeIntervalMilliseconds = 3400;

type Identity = (typeof identities)[number];

type IdentityMotionState = {
  isMotionEnabled: boolean;
  phase: 0 | 1;
};

const initialMotionState: IdentityMotionState = {
  isMotionEnabled: false,
  phase: 0,
};

function getInitialMotionState(): IdentityMotionState {
  if (typeof globalThis.matchMedia !== "function") {
    return initialMotionState;
  }

  return {
    isMotionEnabled: !globalThis.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    phase: 0,
  };
}

function toggleIdentityPhase(currentState: IdentityMotionState) {
  return {
    ...currentState,
    phase: currentState.phase === 0 ? (1 as const) : (0 as const),
  };
}

type GetIdentityOptions = {
  initialIdentity: Identity;
  phase: IdentityMotionState["phase"];
};

function getIdentity(options: GetIdentityOptions) {
  const { initialIdentity, phase } = options;

  if (phase === 0) {
    return initialIdentity;
  }

  return initialIdentity === primaryIdentity
    ? secondaryIdentity
    : primaryIdentity;
}

const IdentityMotionContext = createContext(initialMotionState);

type AnimatedIdentityProviderProps = {
  children: ReactNode;
};

export function AnimatedIdentityProvider(props: AnimatedIdentityProviderProps) {
  const { children } = props;
  const [motionState, setMotionState] = useState(getInitialMotionState);

  useEffect(() => {
    const motionPreference = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let intervalId: ReturnType<typeof globalThis.setInterval> | null = null;

    function clearIdentityInterval() {
      if (intervalId !== null) {
        globalThis.clearInterval(intervalId);
        intervalId = null;
      }
    }

    function startIdentityInterval() {
      intervalId = globalThis.setInterval(() => {
        setMotionState(toggleIdentityPhase);
      }, identityChangeIntervalMilliseconds);
    }

    function syncMotionPreference() {
      clearIdentityInterval();

      if (motionPreference.matches) {
        setMotionState(initialMotionState);
        return;
      }

      setMotionState({ isMotionEnabled: true, phase: 0 });
      startIdentityInterval();
    }

    motionPreference.addEventListener("change", syncMotionPreference);
    if (!motionPreference.matches) {
      startIdentityInterval();
    }

    return () => {
      motionPreference.removeEventListener("change", syncMotionPreference);
      clearIdentityInterval();
    };
  }, []);

  return (
    <IdentityMotionContext.Provider value={motionState}>
      {children}
    </IdentityMotionContext.Provider>
  );
}

type AnimatedIdentityProps = {
  className?: string;
  initialIdentity?: Identity;
};

export function AnimatedIdentity(props: AnimatedIdentityProps) {
  const { className, initialIdentity = primaryIdentity } = props;
  const { isMotionEnabled, phase } = useContext(IdentityMotionContext);
  const identity = getIdentity({ initialIdentity, phase });
  const identityRef = useRef<HTMLSpanElement>(null);
  const controllerRef = useRef<SlotTextController | null>(null);

  useEffect(() => {
    const element = identityRef.current;

    if (!element) {
      return;
    }

    if (!isMotionEnabled) {
      controllerRef.current?.destroy();
      controllerRef.current = null;
      element.textContent = identity;
      return;
    }

    if (!controllerRef.current) {
      controllerRef.current = slotText(element, identity, {
        bounce: 0.3,
        duration: 360,
        stagger: 52,
      });
      return;
    }

    controllerRef.current.set(identity, {
      direction: identity === "@nahtnam" ? "up" : "down",
    });
  }, [identity, isMotionEnabled]);

  useEffect(
    () => () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    },
    []
  );

  return (
    <span aria-hidden="true" className={className} ref={identityRef}>
      {initialIdentity}
    </span>
  );
}
