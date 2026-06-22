// Pin the timezone so date-dependent realtime tests are deterministic
// (matches the shadmin package's global setup).
export const setup = () => {
  process.env.TZ = "Europe/Paris";
};
