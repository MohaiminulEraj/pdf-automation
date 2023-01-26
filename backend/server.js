import path from 'path'
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
// import connectDB from './config/db.js';
import cors from 'cors';
import fileRoutes from './routes/fileRoutes.js';
// parsing .env file
dotenv.config()

// creating server instance
const app = express();

//connect to database
// connectDB();

app.use(express.json()); // parsing body
app.use('/', cors()); // Enabling CORS for all / routes
// app.use(require('./router'));    // Registering all app-routers here



app.use('/api/file', fileRoutes);
const __dirname = path.resolve()

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/build')))

    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    )
} else {
    app.get('/', (req, res) => {
        res.send('API is running....')
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));