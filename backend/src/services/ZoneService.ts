import { Pool } from "pg";
import { Zone } from "../types/domain";

/** Geografische grenzen van de wijk Overdeheg. */
const LAT_MIN = 51.996;
const LAT_MAX = 52.004;
const LNG_MIN = 5.096;
const LNG_MAX = 5.111;

/** Afmetingen van het zoneraster (3 kolommen breed, 2 rijen hoog). */
const GRID_COLS = 3;
const GRID_ROWS = 2;

interface ZoneRow {
  id: number;
  name: string;
  grid_x: number;
  grid_y: number;
}

/**
 * Vertaalt GPS-coordinaten naar een zone van de wijk.
 * De wijk is een raster van 3x2 zones; coordinaten buiten de wijk
 * worden op de dichtstbijzijnde randzone geplakt.
 */
export class ZoneService {
  constructor(private readonly db: Pool) {}

  /** Bepaalt in welke zone de gegeven coordinaten vallen. */
  async deriveZone(latitude: number, longitude: number): Promise<Zone> {
    const clampedLat = Math.min(Math.max(latitude, LAT_MIN), LAT_MAX);
    const clampedLng = Math.min(Math.max(longitude, LNG_MIN), LNG_MAX);

    const colWidth = (LNG_MAX - LNG_MIN) / GRID_COLS;
    const rowHeight = (LAT_MAX - LAT_MIN) / GRID_ROWS;

    const gridX = Math.min(
      Math.floor((clampedLng - LNG_MIN) / colWidth),
      GRID_COLS - 1
    );
    // Rij 0 ligt aan de noordkant, dus de latitude-as wordt omgedraaid.
    const gridY = Math.min(
      Math.floor((LAT_MAX - clampedLat) / rowHeight),
      GRID_ROWS - 1
    );

    const result = await this.db.query<ZoneRow>(
      "SELECT id, name, grid_x, grid_y FROM zones WHERE grid_x = $1 AND grid_y = $2",
      [gridX, gridY]
    );
    if (result.rows.length === 0) {
      throw new Error(`Geen zone gevonden op rasterpositie (${gridX}, ${gridY})`);
    }

    const row = result.rows[0];
    return { id: row.id, name: row.name, gridX: row.grid_x, gridY: row.grid_y };
  }
}
