import React from 'react';

const ToggleSwitch = ({ checked, onChange, label, description, disabled = false }) => (
  <label className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
    {(label || description) && (
      <span className="min-w-0">
        {label && <span className="block text-sm font-bold text-primary">{label}</span>}
        {description && <span className="mt-0.5 block text-xs leading-5 text-secondary font-medium">{description}</span>}
      </span>
    )}
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-10 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-all ${
        checked ? 'bg-accent glow-accent' : 'bg-surface border border-subtle'
      }`}
      aria-pressed={checked}
      aria-label={label || 'Toggle setting'}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </label>
);

export default ToggleSwitch;
