const express = require('express');
app.use(express.static('public'));
const path = require('path');
const app = express();
const port = 3000;

// Placeholder achievement data
const achievements = [
    { title: "Learn JavaScript", completed: false, imageUrl: "https://skinmc.net/achievement/1/Learn+JavaScript!/Start+your+coding+journey" },
    { title: "Complete a 5K", completed: true, imageUrl: "https://skinmc.net/achievement/1/Completed!/You+did+it%21" },
];

// Set the directory for our HTML files (templates)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // We'll use EJS for templating, it's like a mix of HTML and JS

// Main route to display the achievements page
app.get('/', (req, res) => {
    res.render('index', { achievements: achievements });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
