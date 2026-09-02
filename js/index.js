// Mobile menu
document.getElementById('mobile-menu-btn').addEventListener('click', function() {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});
// Close mobile menu on link click
document.querySelectorAll('#mobile-menu a').forEach(function(a) {
    a.addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});
