import YAML from 'yaml';
// Use Vite's ?raw to import the yaml file as a string
import locationsRaw from '../../../content/world/locations.yaml?raw';

export interface Location {
    id: string;
    name: string;
    description: string;
    connections: string[];
}

export interface WorldData {
    locations: Location[];
}

export class WorldEngine {
    private locations: Map<string, Location> = new Map();
    private currentLocationId: string | null = null;

    constructor() {}

    async init(): Promise<void> {
        try {
            const data: WorldData = YAML.parse(locationsRaw);
            for (const loc of data.locations) {
                this.locations.set(loc.id, loc);
            }
            if (this.locations.size > 0) {
                // Set initial location to the first one in the list (usually liminal_entrance)
                this.currentLocationId = data.locations[0].id;
            }
        } catch (error) {
            console.error('[WorldEngine] Failed to load world data:', error);
            throw error;
        }
    }

    getCurrentLocation(): Location | null {
        if (!this.currentLocationId) return null;
        return this.locations.get(this.currentLocationId) || null;
    }

    getLocation(id: string): Location | null {
        return this.locations.get(id) || null;
    }

    moveTo(id: string): boolean {
        if (this.locations.has(id)) {
            this.currentLocationId = id;
            return true;
        }
        return false;
    }
}
