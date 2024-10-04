import axios from 'axios';
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const firstname = document.getElementById('firstname').value;
        const lastname = document.getElementById('lastname').value;
        const email = document.getElementById('formControlInput').value;
        const feedback = document.getElementById('formControlTextarea').value;

        // You might want to add client-side validation here

        // Send data to server using Axios
        axios.post('/feedback', {
            firstname: firstname,
            lastname: lastname,
            email: email,
            feedback: feedback
        })
        .then(function (response) {
            if (response.data.message === 'Data inserted successfully') {
                alert("Login successfully! Thank for feedback.");
                document.getElementById('responseMessage').innerText = 'Data sent successfully!';
                form.reset(); // Clear the form
            } else {
                throw new Error('Server response was not ok.');
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
            alert("Cannot sent data. Try again.");
            document.getElementById('responseMessage').innerText = 'Error sending.';
        });
    });
});
