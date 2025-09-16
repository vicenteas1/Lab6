import express from 'express';
import cors from 'cors';
//configs
import { Logger } from './config/logger.js';
import { connectDB } from './config/db.mongo.js';
import { fileURLToPath } from 'url';
// routes
import ProductsRouter from './routes/product.routes.js';
import UsersRouter from './routes/user.routes.js';
// extras
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerDocument = YAML.load(path.join(__dirname, 'config', 'swagger.yaml'));

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins: string[] = [
  'https://lab6-qlw6.onrender.com',
  'https://lab6-qlw6.onrender.com/api-docs'
];

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/users', UsersRouter);
app.use('/api/products', ProductsRouter);
app.use(cors({
  credentials: true,
  origin(origin: any, callback: any ) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    Logger.info(`Origen no admitido. origin: ${origin}`);
    return callback(new Error(`Origen no admitido: ${origin}`));
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
}));

connectDB().then(() => {
  app.listen(port, () => {
    Logger.info(`Servidor corriendo en http://localhost:${port}`);
    Logger.info(`Swagger disponible en http://localhost:${port}/api-docs`);
  })
});
