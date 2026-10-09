import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Chromium tersedia di path ini (lihat catatan environment)
// Wrapper menambah flag opt-out Local Network Access (Chromium 152 meta build
// memblokir navigasi ke localhost walau Remotion sudah disable fitur lamanya).
// TEMP-DISABLED Config.setBrowserExecutable('/tmp/chrome-wrapper.sh');
// Matikan web security Chromium: environment ini memblokir akses localhost
// (net::ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS) saat render.
Config.setChromiumDisableWebSecurity(true);
