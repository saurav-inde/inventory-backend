const express = require('express');
const app = express();
const url = '0.0.0.0'
const port = 3000;

app.get('/', (req, res)=>{
    res.send('Hello World');
})

app.listen(port, url, () => {
    console.log(`Server running at ${url}:${port}`);
})
