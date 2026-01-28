import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 7070;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('PMO Suite Server is running!');
});

app.use('/api', router);

// This allows us to import the app in our tests
export default app;

// Start the server only if this file is run directly
if (require.main === module) {
    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}
