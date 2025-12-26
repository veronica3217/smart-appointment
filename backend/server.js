const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/auth', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/admin', require('./routes/admin'));
app.use(express.static('../frontend'));
const PORT = 3000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
