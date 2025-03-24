import fs from 'fs';
import path from 'path';
import url from 'url';

// in ECMAScript Modules (ESM), __dirname is not available directly like in CommonJS
// use 'url' and 'path' modules to achieve similar functionality
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// define the path to the mock database directory
const dbDirectory = path.resolve(__dirname, 'mock_database');

/**
 * Reads and parses JSON data from a file
 * @param {string} collection - the name of the collection file
 * @returns {Promise<Array|Object>} the parsed JSON data from the collection
 * @throws {Error} an error if there's an issue reading or parsing the data
 */
const _read = async (collection) => {
    try {
        const fullPath = path.resolve(dbDirectory, `${collection}.json`);
        const data = await fs.promises.readFile(fullPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Error reading data from collection ${collection}: ${error.message}`);
    }
};

/**
 * Inserts a new entry in a collection
 * @param {string} collection - the name of the collection file
 * @param {Object} data - the data to be added to the collection
 * @returns {Promise<void>} a Promise that resolves when the operation is complete
 * @throws {Error} an error if there's an issue inserting the record
 */
export const insert = async (collection, data) => {
    try {
        // generate a simple unique ID based on timestamp and random number
        const _id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // add the generated _id to the record
        const recordWithId = { ...data, _id };

        // read existing records from the collection
        const records = await _read(collection);

        // push the new record with the unique _id
        records.push(recordWithId);

        // write the updated records back to the file
        const fullPath = path.resolve(dbDirectory, `${collection}.json`);
        await fs.promises.writeFile(fullPath, JSON.stringify(records));
    } catch (error) {
        throw new Error(`Error inserting record in collection ${collection}: ${error.message}`);
    }
};

/**
 * Finds all records or a record by ID in a collection
 * @param {string} collection - the name of the collection file
 * @param {Object|null} query - an object with a single key and value to match
 * @returns {Promise<Array|Object|null>} the record(s) found in the collection
 * @throws {Error} an error if there's an issue finding the record(s)
 */
export const find = async (collection, query = null) => {
    try {
        const records = await _read(collection);

        if (query) {
            // destructure the key-value pair from the query object
            const [key, value] = Object.entries(query)[0];

            // attempt to get matching records
            const matches = records.filter((record) => record[key] === value);

            // return matching records - could be empty array if none found
            return matches;
        } else {
            // return all records if no query is provided
            return records;
        }
    } catch (error) {
        // throw an error if there's an issue finding the records
        throw new Error(`Error finding record in collection ${collection}: ${error.message}`);
    }
};
