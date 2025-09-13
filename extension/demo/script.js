function sayHello() {
    console.log("Hello from LookAtni custom markers!");
    document.body.style.backgroundColor = getRandomColor();
}

function getRandomColor() {
    const colors = ['#ffebee', '#e8f5e8', '#e3f2fd', '#fff3e0'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    console.log("LookAtni demo loaded!");
    setInterval(sayHello, 3000);
});
