// import axios from 'axios';
//
// document.addEventListener('DOMContentLoaded', function() {
//     const form = document.getElementById('feedbackForm');
//     const responseMessage = document.getElementById('responseMessage');
//
//     form.addEventListener('submit', function(e) {
//         e.preventDefault();
//
//         const formData = new FormData(form);
//         const data = Object.fromEntries(formData);
//
//         axios.post('/feedback', data, {
//             headers: {
//                 'Content-Type': 'application/json',
//             }
//         })
//         .then(function (response) {
//             if (response.data.message === 'Data inserted successfully') {
//                 alert("Login successfully! Thank you for your feedback.");
//                 responseMessage.textContent = 'Data sent successfully!';
//                 form.reset(); // Clear the form
//             } else {
//                 throw new Error('Server response was not ok.');
//             }
//         })
//         .catch(function (error) {
//             console.error('Error:', error);
//             alert("Cannot send data. Try again.");
//             responseMessage.textContent = 'An error occurred while submitting the form.';
//         });
//     });
// });
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const responseMessage = document.getElementById('responseMessage');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        fetch('/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Data inserted successfully') {
                alert("Submit successfully! Thank for your feeback !!!");
                responseMessage.textContent = 'Data sent successfully!';
                form.reset(); // Xóa form
            } else {
                throw new Error('Phản hồi từ server không hợp lệ.');
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert("Cannot sent feedback. Try after later.");
            responseMessage.textContent = 'Get something wrong when send form.';
        });
    });
});
