document.addEventListener('DOMContentLoaded', () =>{
    //Toggle dark mode
    darkModleToggle.addEventListener('click', () =>{
        body.classList.toggle('dark-mode');
        navbar.classlist.toggle('dark-mode');
        documnent.querySelectorAll('.card').forEach(card => {
            card.classList.toggle('dark-mode');
        });
        darkModeToggle.textContent = (darkModeToggle.textContent ==='dark Mode') ? 'Light Mode' : 'Dark Mode';
    })
})