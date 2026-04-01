const fs = require('fs');
const path = require('path');
const url = require('url');

const DB_PATH = path.join(__dirname, 'movies-db.json');

// --- Helper Functions ---
const readDB = () => {
    return new Promise((resolve, reject) => {
        fs.readFile(DB_PATH, 'utf8', (err, data) => {
            if (err) return reject(err);
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(new Error("Failed to parse JSON file"));
            }
        });
    });
};

const writeDB = (data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new SyntaxError('Invalid JSON format'));
            }
        });
    });
};

// --- Main API Handler ---
async function handleApiRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    const idMatch = pathname.match(/^\/movies\/([a-zA-Z0-9_-]+)$/);
    const id = idMatch ? idMatch[1] : null;

    try {
        const movies = await readDB();

        // 1. GET /movies
        if (pathname === '/movies' && method === 'GET') {
            let result = [...movies];
            if (parsedUrl.query.search) {
                const searchStr = parsedUrl.query.search.toLowerCase();
                result = result.filter(m => 
                    (m.title && m.title.toLowerCase().includes(searchStr)) || 
                    (m.original_title && m.original_title.toLowerCase().includes(searchStr))
                );
            }
            if (parsedUrl.query.limit) {
                const limit = parseInt(parsedUrl.query.limit, 10);
                if (!isNaN(limit) && limit > 0) result = result.slice(0, limit);
            }
            return sendResponse(res, 200, result);
        }

        // 2. GET /movies/:id
        if (id && method === 'GET') {
            const movie = movies.find(m => String(m.id) === id);
            if (!movie) return sendResponse(res, 404, { error: `Movie with id ${id} not found` });
            return sendResponse(res, 200, movie);
        }

        // 3. POST /movies
        if (pathname === '/movies' && method === 'POST') {
            const body = await parseBody(req);
            if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
                return sendResponse(res, 400, { error: '"title" is required and must be a valid string.' });
            }
            if (typeof body.year !== 'number') {
                return sendResponse(res, 400, { error: '"year" is required and must be a number.' });
            }
            if (body.rating !== undefined && typeof body.rating !== 'number') {
                return sendResponse(res, 400, { error: '"rating" must be a number.' });
            }

            const newMovie = { id: Date.now().toString(), ...body };
            movies.unshift(newMovie);
            await writeDB(movies);
            return sendResponse(res, 201, { message: 'Movie added successfully', movie: newMovie });
        }

        // 4. PATCH /movies/:id
        if (id && method === 'PATCH') {
            const body = await parseBody(req);
            const index = movies.findIndex(m => String(m.id) === id);
            if (index === -1) return sendResponse(res, 404, { error: `Movie with id ${id} not found` });

            if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
                return sendResponse(res, 400, { error: 'If providing "title", it cannot be empty.' });
            }
            if (body.year !== undefined && typeof body.year !== 'number') {
                return sendResponse(res, 400, { error: '"year" must be a number.' });
            }
            if (body.rating !== undefined && typeof body.rating !== 'number') {
                return sendResponse(res, 400, { error: '"rating" must be a number.' });
            }

            movies[index] = { ...movies[index], ...body };
            movies[index].id = id; // prevent id modification
            await writeDB(movies);
            return sendResponse(res, 200, { message: 'Movie updated successfully', movie: movies[index] });
        }

        // 5. DELETE /movies/:id
        if (id && method === 'DELETE') {
            const index = movies.findIndex(m => String(m.id) === id);
            if (index === -1) return sendResponse(res, 404, { error: `Movie with id ${id} not found` });

            const deletedMovie = movies.splice(index, 1)[0];
            await writeDB(movies);
            return sendResponse(res, 200, { message: 'Movie deleted successfully', movie: deletedMovie });
        }

        return sendResponse(res, 404, { error: 'Route not found' });

    } catch (err) {
        if (err.name === 'SyntaxError') return sendResponse(res, 400, { error: 'Invalid JSON request body.' });
        return sendResponse(res, 500, { error: 'Internal Server Error', details: err.message });    }
}

module.exports = handleApiRequest;
