import 'dotenv/config';
import { app } from './app';

const start = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL must be defined');
    }

    try {
        // Connect to database if we abstracted it, strictly Prisma connects lazily but good to verify.
        console.log('Connected to Database');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000');
    });
};

start();
