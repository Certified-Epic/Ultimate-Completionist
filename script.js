document.addEventListener('DOMContentLoaded', () => {
    const achievementsContainer = document.getElementById('achievements-container');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const zoomContainer = document.querySelector('.achievement-tracker-container');
    
    let scale = 1;
    let isDragging = false;
    let startX, startY, currentX, currentY;
    let translateX = 0, translateY = 0;

    // Define your achievements here
    // The parent property links achievements together to form branches
    const achievements = [
        { id: 1, parent: null, imageText1: 'Achievement Get!', imageText2: 'Begin the Journey' },
        { id: 2, parent: 1, imageText1: 'First Day of School', imageText2: 'Go to Class' },
        { id: 3, parent: 2, imageText1: 'Social Butterfly', imageText2: 'Make a Friend' },
        { id: 4, parent: 3, imageText1: 'Master of Procrastination', imageText2: 'Pull an All-Nighter' },
        { id: 5, parent: 1, imageText1: 'Chef in Training', imageText2: 'Cook a Meal' },
        { id: 6, parent: 5, imageText1: 'Culinary Master', imageText2: 'Cook 10 Unique Meals' },
        { id: 7, parent: 6, imageText1: 'Starving Artist', imageText2: 'Make Your Own Recipe' },
        { id: 8, parent: 1, imageText1: 'Fitness Fanatic', imageText2: 'Start a Workout Routine' },
    ];

    const achievementElements = {};
    const achievementPositions = {};

    // Create achievement elements and position them
    function renderAchievements() {
        // Clear existing elements
        achievementsContainer.innerHTML = '';
        
        // Use a simple layout algorithm to position achievements
        // This is a basic example; you could use a more advanced graph-layout library for complex layouts.
        let yOffset = 0;
        const xOffsets = {};

        achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.classList.add('achievement-node');
            
            // Construct the embed URL
            const urlText1 = achievement.imageText1.replace(/ /g, '+');
            const urlText2 = achievement.imageText2.replace(/ /g, '+');
            const embedUrl = `https://skinmc.net/achievement/1/${urlText1}/${urlText2}`;
            
            achievementElement.innerHTML = `<img src="${embedUrl}" alt="IRL Achievement: ${achievement.imageText2}" />`;
            
            // Store a reference to the element
            achievementElements[achievement.id] = achievementElement;

            // Simple positioning logic
            if (achievement.parent === null) {
                // Main branch starts at the top
                yOffset = 0;
                achievementPositions[achievement.id] = { x: 0, y: yOffset };
                xOffsets[achievement.id] = 0;
            } else {
                // Branch off from the parent
                const parentPos = achievementPositions[achievement.parent];
                
                // For a more structured branching, you would need a more complex algorithm.
                // This simple version just offsets subsequent achievements.
                const newY = parentPos.y + 200; // Vertical distance between achievements
                const newX = xOffsets[achievement.parent] + (achievement.id % 2 === 0 ? -200 : 200); // Simple horizontal branching
                
                achievementPositions[achievement.id] = { x: newX, y: newY };
                xOffsets[achievement.id] = newX;
                yOffset = newY;
            }

            achievementElement.style.left = `${achievementPositions[achievement.id].x}px`;
            achievementElement.style.top = `${achievementPositions[achievement.id].y}px`;
            
            achievementsContainer.appendChild(achievementElement);
        });

        // Draw lines between parent and child achievements
        achievements.forEach(achievement => {
            if (achievement.parent !== null) {
                const parentPos = achievementPositions[achievement.parent];
                const childPos = achievementPositions[achievement.id];

                const line = document.createElement('div');
                line.classList.add('line');

                // Calculate line position and length
                const dx = childPos.x - parentPos.x;
                const dy = childPos.y - parentPos.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                line.style.width = `${length}px`;
                line.style.transform = `rotate(${angle}deg)`;
                line.style.left = `${parentPos.x}px`;
                line.style.top = `${parentPos.y}px`;

                achievementsContainer.appendChild(line);
            }
        });
    }

    // Zoom functionality
    function updateTransform() {
        achievementsContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    zoomInButton.addEventListener('click', () => {
        scale = Math.min(scale + 0.1, 2); // Max zoom level
        updateTransform();
    });

    zoomOutButton.addEventListener('click', () => {
        scale = Math.max(scale - 0.1, 0.5); // Min zoom level
        updateTransform();
    });

    // Panning (drag and drop) functionality
    zoomContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        currentX = translateX;
        currentY = translateY;
        zoomContainer.style.cursor = 'grabbing';
    });

    zoomContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        translateX = currentX + dx;
        translateY = currentY + dy;
        updateTransform();
    });

    zoomContainer.addEventListener('mouseup', () => {
        isDragging = false;
        zoomContainer.style.cursor = 'grab';
    });

    zoomContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        zoomContainer.style.cursor = 'default';
    });
    
    // Initial render
    renderAchievements();
});
