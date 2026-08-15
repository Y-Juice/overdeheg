import { Session } from "../types/store";

const UID_KEY = "overdeheg.uid";
const LAT_KEY = "overdeheg.lat";
const LNG_KEY = "overdeheg.lng";

const LAT_MIN = 51.996;
const LAT_MAX = 52.004;
const LNG_MIN = 5.096;
const LNG_MAX = 5.111;

/**
 * Kiest een willekeurig punt binnen de wijkgrenzen
 * als de browser geen echte locatie geeft.
 */
function randomNeighbourhoodPoint(): { latitude: number; longitude: number } {
  return {
    latitude: LAT_MIN + Math.random() * (LAT_MAX - LAT_MIN),
    longitude: LNG_MIN + Math.random() * (LNG_MAX - LNG_MIN)
  };
}

/**
 * Leest of maakt de lokale sessie: een vaste UID en GPS-positie.
 * Zo blijft dezelfde bewoner herkenbaar over herstarts heen.
 */
export function loadOrCreateSession(): Session {
  const storedUid = window.localStorage.getItem(UID_KEY);
  const storedLat = window.localStorage.getItem(LAT_KEY);
  const storedLng = window.localStorage.getItem(LNG_KEY);

  if (storedUid && storedLat && storedLng) {
    return {
      uid: storedUid,
      latitude: Number(storedLat),
      longitude: Number(storedLng),
      zoneId: null,
      zoneName: null,
      homeZoneId: null,
      homeZoneName: null
    };
  }

  const point = randomNeighbourhoodPoint();
  const uid = window.crypto.randomUUID();
  window.localStorage.setItem(UID_KEY, uid);
  window.localStorage.setItem(LAT_KEY, String(point.latitude));
  window.localStorage.setItem(LNG_KEY, String(point.longitude));

  return {
    uid,
    latitude: point.latitude,
    longitude: point.longitude,
    zoneId: null,
    zoneName: null,
    homeZoneId: null,
    homeZoneName: null
  };
}
