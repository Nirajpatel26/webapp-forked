const request = require('supertest');

const {app,server} = require('../../app');
const {sequelize} =require('../db/sequelize') 



describe('Health Check Route', () => {

    beforeAll(async () => {

       
        if (!sequelize) {
            throw new Error("Sequelize instance is undefined!");
        }
    
        await sequelize.sync({ force: true });
    });
    afterAll(async () => {
        // Close server first, then database
        await new Promise(resolve => server.close(resolve));
        await sequelize.close();

    });

    it('should return 405 Method Not Allowed for HEAD requests', async() => {
        await request(app)
            .head('/healthz')
            .expect(405);
    });

    it('should return 200 OK for valid GET requests', async() => {
        await request(app)
            .get('/healthz')
            .expect(200);
    });

    it('should return 400 Bad Request for GET requests with query parameters', async() => {
        await request(app)
            .get('/healthz?param=value')
            .expect(400);
    });

    it('should return 400 Bad Request for GET requests with body data', async() => {
        await request(app)
            .get('/healthz')
            .send({ key: 'value' })
            .expect(400);
    });

    it('should return 400 Bad Request for GET requests with authorization header', async() => {
        await request(app)
            .get('/healthz')
            .set('Authorization', 'Bearer token')
            .expect(400);
    });

    it('should return 400 Bad Request for GET requests with content length', async() => {
        await request(app)
            .get('/healthz')
            .set('Content-Length', '10')
            .expect(400);
    });

    it('should return 405 Method Not Allowed for unsupported methods', async() => {
        await request(app)
            .put('/healthz')
            .expect(405);
    });

    it('should return 404 Not Found for GET requests to other paths', async() => {
        await request(app)
            .get('/unknownpath')
            .expect(404);
    });
});