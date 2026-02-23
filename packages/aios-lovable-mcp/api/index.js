import { HttpServer } from '../dist/services/http-server.js';

const server = new HttpServer(process.env.PORT || 3000);
export default server.app;
