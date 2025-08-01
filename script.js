// ...
const achievements = [
    // Changed icon from 1 to 13 for a different look
    { id: 1, parent: null, icon: 13, imageText1: 'Achievement Get!', imageText2: 'Begin the Journey' },
    // Another icon, for a different achievement
    { id: 2, parent: 1, icon: 41, imageText1: 'First Day of School', imageText2: 'Go to Class' },
    { id: 3, parent: 2, icon: 20, imageText1: 'Social Butterfly', imageText2: 'Make a Friend' },
    { id: 4, parent: 3, icon: 38, imageText1: 'Master of Procrastination', imageText2: 'Pull an All-Nighter' },
    { id: 5, parent: 1, icon: 16, imageText1: 'Chef in Training', imageText2: 'Cook a Meal' },
    // ... add more achievements with different icons
];
// ...
// ...
function renderAchievements() {
    // ...
    achievements.forEach(achievement => {
        // ...
        // Construct the embed URL using the achievement's icon property
        const urlText1 = achievement.imageText1.replace(/ /g, '+');
        const urlText2 = achievement.imageText2.replace(/ /g, '+');
        const embedUrl = `https://skinmc.net/achievement/${achievement.icon}/${urlText1}/${urlText2}`;
        
        achievementElement.innerHTML = `<img src="${embedUrl}" alt="IRL Achievement: ${achievement.imageText2}" />`;
        // ...
    });
    // ...
}
// ...
document.addEventListener('DOMContentLoaded', () => {
    // ... (existing code)

    // Initial position to center the view
    // This is more of a fine-tuning step. The CSS `translate(-50%, -50%)` already centers it,
    // but if you have a very uneven tree, you might need to adjust `translateX` and `translateY`
    // after the initial render to keep the interesting part of the tree in view.
    // For now, let's keep the existing logic and add the scroll zoom.

    // Add event listener for mouse scroll (wheel event)
    zoomContainer.addEventListener('wheel', (e) => {
        e.preventDefault(); // Prevents the page from scrolling
        
        // Determine the zoom direction
        const delta = Math.sign(e.deltaY); // -1 for zoom in, 1 for zoom out
        const zoomSpeed = 0.1;
        
        // Update the scale
        scale = scale - delta * zoomSpeed;
        scale = Math.max(0.5, Math.min(scale, 2)); // Clamp the scale to prevent extreme zoom
        
        // You can also add logic to zoom to the cursor position, which is more advanced.
        // For a simple zoom, just update the transform.
        updateTransform();
    }, { passive: false }); // `passive: false` is important to allow `preventDefault`
    
    // ... (rest of the existing code)
});
document.addEventListener('DOMContentLoaded', () => {
    // ... (existing code)

    let initialPinchDistance = null;

    zoomContainer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            isDragging = false;
            // Calculate the initial distance between the two touches
            initialPinchDistance = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
        } else if (e.touches.length === 1) {
            // Re-use the existing drag logic for single-touch panning
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = translateX;
            currentY = translateY;
        }
    });

    zoomContainer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const currentPinchDistance = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
            
            if (initialPinchDistance) {
                const pinchScale = currentPinchDistance / initialPinchDistance;
                scale = Math.max(0.5, Math.min(scale * pinchScale, 2)); // Apply new scale
                initialPinchDistance = currentPinchDistance; // Update initial for next move
                updateTransform();
            }
        } else if (isDragging && e.touches.length === 1) {
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            translateX = currentX + dx;
            translateY = currentY + dy;
            updateTransform();
        }
    });

    zoomContainer.addEventListener('touchend', (e) => {
        initialPinchDistance = null;
        isDragging = false;
    });

    // ... (rest of the existing code)
});

