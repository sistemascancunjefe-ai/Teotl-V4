import { describe, it, expect, mock } from 'bun:test';
import { WorldEngine } from './world.ts';

describe('WorldEngine', () => {
    it('should initialize correctly with valid data', async () => {
        const engine = new WorldEngine();
        const mockData = {
            locations: [
                { id: 'loc1', name: 'Location 1', description: 'Desc 1', connections: [] },
                { id: 'loc2', name: 'Location 2', description: 'Desc 2', connections: ['loc1'] }
            ]
        };

        engine.yamlParser = {
            parse: mock(() => mockData)
        } as any;

        await engine.init();

        expect(engine.getCurrentLocation()?.id).toBe('loc1');
        expect(engine.getLocation('loc2')?.name).toBe('Location 2');
    });

    it('should throw error when YAML parsing fails', async () => {
        const engine = new WorldEngine();
        const parsingError = new Error('YAML Parsing Error');

        engine.yamlParser = {
            parse: mock(() => {
                throw parsingError;
            })
        } as any;

        // We expect the error to be re-thrown
        await expect(engine.init()).rejects.toThrow('YAML Parsing Error');
    });

    it('should handle empty locations list', async () => {
        const engine = new WorldEngine();
        const mockData = {
            locations: []
        };

        engine.yamlParser = {
            parse: mock(() => mockData)
        } as any;

        await engine.init();

        expect(engine.getCurrentLocation()).toBeNull();
    });

    it('should navigate between locations', async () => {
        const engine = new WorldEngine();
        const mockData = {
            locations: [
                { id: 'loc1', name: 'Location 1', description: 'Desc 1', connections: ['loc2'] },
                { id: 'loc2', name: 'Location 2', description: 'Desc 2', connections: ['loc1'] }
            ]
        };

        engine.yamlParser = {
            parse: mock(() => mockData)
        } as any;

        await engine.init();

        expect(engine.getCurrentLocation()?.id).toBe('loc1');

        const moveResult = engine.moveTo('loc2');
        expect(moveResult).toBe(true);
        expect(engine.getCurrentLocation()?.id).toBe('loc2');

        const invalidMove = engine.moveTo('nonexistent');
        expect(invalidMove).toBe(false);
        expect(engine.getCurrentLocation()?.id).toBe('loc2');
    });
});
