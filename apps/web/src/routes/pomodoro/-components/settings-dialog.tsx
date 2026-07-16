import { SettingsIcon, XIcon } from "lucide-react";
import { useId, useRef } from "react";

import { presets } from "../-lib/timer";
import type { Settings } from "../-lib/timer";

type SettingsDialogProps = {
  onApplyPreset: (settings: Settings) => void;
  onUpdateSettings: (settings: Partial<Settings>) => void;
  settings: Settings;
};

export function SettingsDialog(props: SettingsDialogProps) {
  const { onApplyPreset, onUpdateSettings, settings } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  function openDialog() {
    dialogRef.current?.showModal();
  }

  return (
    <>
      <div className="tooltip tooltip-bottom" data-tip="Settings">
        <button
          aria-label="Open Pomodoro settings"
          className="btn btn-square btn-ghost"
          onClick={openDialog}
          type="button"
        >
          <SettingsIcon aria-hidden="true" className="size-5" />
        </button>
      </div>

      <dialog
        aria-labelledby={titleId}
        className="modal modal-end sm:modal-middle"
        ref={dialogRef}
      >
        <div className="modal-box max-h-[90svh] max-w-lg bg-base-100 p-0 text-base-content">
          <header className="flex items-start justify-between gap-4 border-b border-base-300 px-6 py-5">
            <div>
              <p className="route-kicker">Timer controls</p>
              <h2 className="heading mt-2 text-2xl" id={titleId}>
                Settings
              </h2>
            </div>
            <form method="dialog">
              <button
                aria-label="Close settings"
                className="btn btn-square btn-ghost btn-sm"
                type="submit"
              >
                <XIcon aria-hidden="true" className="size-4" />
              </button>
            </form>
          </header>

          <div className="space-y-7 overflow-y-auto px-6 py-6">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Presets</legend>
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset) => (
                  <button
                    className="btn btn-sm"
                    key={preset.label}
                    onClick={() => {
                      onApplyPreset(preset.settings);
                    }}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <p className="label">Choose a rhythm, then tune it below.</p>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Focus"
                max={120}
                min={1}
                suffix="min"
                value={settings.focusMinutes}
                onChange={(value) => {
                  onUpdateSettings({ focusMinutes: value });
                }}
              />
              <NumberField
                label="Short break"
                max={60}
                min={1}
                suffix="min"
                value={settings.shortBreakMinutes}
                onChange={(value) => {
                  onUpdateSettings({ shortBreakMinutes: value });
                }}
              />
              <NumberField
                label="Long break"
                max={90}
                min={1}
                suffix="min"
                value={settings.longBreakMinutes}
                onChange={(value) => {
                  onUpdateSettings({ longBreakMinutes: value });
                }}
              />
              <NumberField
                label="Cycles"
                max={12}
                min={1}
                suffix="blocks"
                value={settings.segmentsBeforeLongBreak}
                onChange={(value) => {
                  onUpdateSettings({ segmentsBeforeLongBreak: value });
                }}
              />
            </div>

            <div className="space-y-3">
              <ToggleRow
                description="Start the next timer automatically."
                isChecked={settings.autoStartNext}
                label="Auto-start"
                onCheckedChange={(checked) => {
                  onUpdateSettings({ autoStartNext: checked });
                }}
              />
              <ToggleRow
                description="Ring when a timer reaches zero."
                isChecked={settings.soundEnabled}
                label="Alarm"
                onCheckedChange={(checked) => {
                  onUpdateSettings({ soundEnabled: checked });
                }}
              />
            </div>
          </div>
        </div>
        <form className="modal-backdrop" method="dialog">
          <button type="submit">Close settings</button>
        </form>
      </dialog>
    </>
  );
}

type NumberFieldProps = {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  suffix: string;
  value: number;
};

function NumberField(props: NumberFieldProps) {
  const { label, max, min, onChange, suffix, value } = props;

  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      <label className="input w-full">
        <input
          className="grow font-mono tabular-nums"
          max={max}
          min={min}
          type="number"
          value={value}
          onChange={(event) => {
            onChange(Number(event.target.value));
          }}
        />
        <span className="text-xs text-base-content/50">{suffix}</span>
      </label>
    </fieldset>
  );
}

type ToggleRowProps = {
  description: string;
  isChecked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow(props: ToggleRowProps) {
  const { description, isChecked, label, onCheckedChange } = props;

  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-box border border-base-300 bg-base-200/50 p-4">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-1 block text-sm leading-5 text-base-content/60">
          {description}
        </span>
      </span>
      <input
        aria-label={label}
        checked={isChecked}
        className="toggle shrink-0"
        type="checkbox"
        onChange={(event) => {
          onCheckedChange(event.target.checked);
        }}
      />
    </label>
  );
}
