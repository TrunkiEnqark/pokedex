document.addEventListener('DOMContentLoaded', () => {
    const feedbackList = document.getElementById('feedbackList');
    const feedbackData = JSON.parse(localStorage.getItem('feedbackData')) || [];

    if (feedbackData.length === 0) {
        feedbackList.innerHTML = '<p>No feedback available.</p>';
    } else {
        feedbackData.forEach((feedback, index) => {
            const feedbackItem = document.createElement('div');
            feedbackItem.classList.add('list-group-item');
            feedbackItem.innerHTML = `
                <h5>Feedback #${index + 1}</h5>
                <p><strong>Name:</strong> ${feedback.firstname} ${feedback.lastname}</p>
                <p><strong>Email:</strong> ${feedback.email}</p>
                <p><strong>Feedback:</strong> ${feedback.feedback}</p>
            `;
            feedbackList.appendChild(feedbackItem);
        });
    }
});
