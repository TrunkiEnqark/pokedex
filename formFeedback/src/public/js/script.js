document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const responseMessage = document.getElementById('responseMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        fetch('/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response =>{
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json()
        })
        .then(data => {
            if (data.message === 'Data inserted successfully') {
                alert("Submit successfully! Thank for your feeback !!!");
                responseMessage.textContent = 'Data sent successfully!';
                responseMessage.style.color = 'green';
                form.reset(); // Xóa form
            } else {
                throw new Error('Phản hồi từ server không hợp lệ.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Cannot sent feedback. Try after later.");
            responseMessage.textContent = 'Get something wrong when send form.';
            responseMessage.style.color = 'red';
        });
    });
});
