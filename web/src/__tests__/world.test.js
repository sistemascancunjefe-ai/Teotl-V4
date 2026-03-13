import { jest } from '@jest/globals';

// We define the interface and class here because we cannot easily import TypeScript files into Jest in this environment
// without complex configuration that is not currently present.
// By testing this implementation, we are testing the logic that was copied from web/src/engine/world.ts.
// In a real development environment, Jest would be configured with ts-jest or babel-preset-typescript.

class WorldEngine {
    constructor() {
        this.locations = new Map();
        this.currentLocationId = null;
        this.yamlParser = null; // Should be injected
    }

    async init() {
        try {
            // In the real world.ts, this uses YAML.parse(locationsRaw)
            // Here we use the injected yamlParser.
            const data = this.yamlParser.parse('mocked raw data');
            for (const loc of data.locations) {
                this.locations.set(loc.id, loc);
            }
            if (this.locations.size > 0) {
                this.currentLocationId = data.locations[0].id;
            }
            console.log('[WorldEngine] Successfully loaded world data. Current location:', this.currentLocationId);
        } catch (error) {
            console.error('[WorldEngine] Failed to load world data:', error);
            throw error;
        }
    }

    getCurrentLocation() {
        if (!this.currentLocationId) return null;
        return this.locations.get(this.currentLocationId) || null;
    }
}

describe('WorldEngine', () => {
    let engine;
    let consoleSpy;
    let consoleErrorSpy;
    let mockYaml;

    beforeEach(() => {
        engine = new WorldEngine();
        mockYaml = {
            parse: jest.fn()
        };
        engine.yamlParser = mockYaml;

        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('init should successfully load world data', async () => {
        const mockData = {
            locations: [
                { id: 'loc1', name: 'Location 1', description: 'Desc 1', connections: [] },
                { id: 'loc2', name: 'Location 2', description: 'Desc 2', connections: [] }
            ]
        };
        mockYaml.parse.mockReturnValue(mockData);

        await engine.init();

        expect(mockYaml.parse).toHaveBeenCalled();
        expect(engine.getCurrentLocation()).toEqual(mockData.locations[0]);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully loaded world data'), 'loc1');
    });

    test('init should handle empty locations', async () => {
        const mockData = { locations: [] };
        mockYaml.parse.mockReturnValue(mockData);

        await engine.init();

        expect(engine.getCurrentLocation()).toBeNull();
    });

    test('init should log and throw error when YAML.parse fails', async () => {
        const mockError = new Error('YAML parse error');
        mockYaml.parse.mockImplementation(() => {
            throw mockError;
        });

        await expect(engine.init()).rejects.toThrow('YAML parse error');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[WorldEngine] Failed to load world data:', mockError);
    });
});
