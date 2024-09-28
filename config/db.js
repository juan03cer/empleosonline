const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

mongoose.connect(process.env.DATABASE);

mongoose.connection.on('connected', () => {
    console.log('Conectado a MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('Error conectando a MongoDB:', error);
});

// Importar los modelos
require('../models/Vacantes');
require('../models/Usuarios');