import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { clear, init, keys, read, remove, write } from '../src/db';

describe('Database Test', () => {
    beforeAll(() => {
        init('testdb');
    });

    beforeEach(() => {
        clear();
    });

    afterAll(() => {
        const fs = require('fs');
        if (fs.existsSync('testdb.db')) {
            fs.unlinkSync('testdb.db');
        }
    });

    it('should write and read data correctly', () => {
        write('key1', 'value1');
        const value = read('key1');
        expect(value).toBe('value1');
    });

    it('should remove data correctly', () => {
        write('key2', 'value2');
        remove('key2');
        const value = read('key2');
        expect(value).toBeNull();
    });

    it('should clear all data correctly', () => {
        write('key3', 'value3');
        write('key4', 'value4');
        clear();
        const value3 = read('key3');
        const value4 = read('key4');
        expect(value3).toBeNull();
        expect(value4).toBeNull();
    });

    it('should retrieve keys correctly', () => {
        write('keyA', 'valueA');
        write('keyB', 'valueB');
        const allKeys = keys();
        expect(allKeys).toContain('keyA');
        expect(allKeys).toContain('keyB');
    });
});