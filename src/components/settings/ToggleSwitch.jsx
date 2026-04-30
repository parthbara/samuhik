import React from 'react';

const ToggleSwitch = ({ checked, onChange, label, description, disabled = false }) => (
  <label className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-60' : ''}`}>
    {(label || description) && (
      <span className="min-w-0">
        {label && <span className="block text-sm font-bold text-slate-800">{label}</span>}
        {description && <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>}
      </span>
    )}
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-10 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
      aria-pressed={checked}
      aria-label={label || 'Toggle setting'}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </label>
);

export default ToggleSwitch;
