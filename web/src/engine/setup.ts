import { mock } from 'bun:test';

// Mock the YAML import since bun cannot find it in this environment
mock.module('yaml', () => ({
    default: {
        parse: () => ({ locations: [] })
    }
}));

// Mock the locationsRaw import since bun might struggle with ?raw
mock.module('../../../content/world/locations.yaml?raw', () => ({
    default: ''
}));
