const demoModeValue = import.meta.env.VITE_DEMO_MODE;

export const DEMO_MODE =
  demoModeValue === undefined ? true : String(demoModeValue).toLowerCase() === 'true';

export const APP_NAME = 'Samuhik';

export const APP_TAGLINE = 'Omnichannel commerce inbox';
