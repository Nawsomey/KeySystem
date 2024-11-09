document.addEventListener('DOMContentLoaded', () => {
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    const generatedKey = document.getElementById('generatedKey');
    const copyBtn = document.querySelector('.copy-btn');
    const notification = document.getElementById('notification');

    generateKeyBtn.addEventListener('click', generateKey);
    copyBtn.addEventListener('click', copyKey);

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type} show`; // Add .show class
        setTimeout(() => {
            notification.classList.remove('show'); // Remove .show class after delay
        }, 3000);
    }

    function generateKey() {
        fetch('/generateKey')
            .then(response => response.json())
            .then(data => {
                generatedKey.textContent = data.secretKey;
                showNotification('Key generated!', 'success');
            })
            .catch(error => {
                console.error('Error fetching key:', error);
                showNotification('Error generating key', 'error');
            });
    }

    function copyKey() {
        navigator.clipboard.writeText(generatedKey.textContent)
            .then(() => {
                showNotification('Key copied!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                showNotification('Error copying key', 'error');
            });
    }
});
