const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const dbConnect = require('./src/configs/db')

dotenv.config();
dbConnect(); 

const app = express();

app.use(cors()); 
app.use(express.json());

const geminiRoutes = require('./src/routes/gemini.route');
const elevenLabsRoutes = require('./src/routes/elevenLabs.route');
const authRoutes = require('./src/routes/auth.route'); 

app.use('/api/gemini', geminiRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/elevenLabs', elevenLabsRoutes); 

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
