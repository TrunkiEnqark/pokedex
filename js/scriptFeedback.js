document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        const feedback = document.getElementById('feedback').value;

        const formData = {
            firstname,
            lastname,
            email,
            feedback
        };

        // Store data into localStorage
        let feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || [];
        //check save successfully
        if (feedbackData.push(formData))  alert("Add successfully");
        else alert("Cannot save feedback. Try again.");
        localStorage.setItem('feedbackData', JSON.stringify(feedbackData));

        //Remove form data after submit
        form.reset();
    });
});
