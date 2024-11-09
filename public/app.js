// app.js
document.addEventListener('DOMContentLoaded', () => {
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    const generatedKey = document.getElementById('generatedKey');
    const copyBtn = document.querySelector('.copy-btn');
    const notification = document.getElementById('notification');

    generateKeyBtn.addEventListener('click', generateKey);
    copyBtn.addEventListener('click', copyKey);

    function generateKey() {
        fetch('/generateKey')
            .then(response => response.json())
            .then(data => {
                generatedKey.textContent = data.secretKey;
                notification.textContent = 'Key generated!';
                notification.classList.add('success');
                setTimeout(() => {
                    notification.textContent = '';
                    notification.classList.remove('success');
                }, 3000);
            })
            .catch(error => {
                console.error('Error fetching key:', error);
                notification.textContent = 'Error generating key';
                notification.classList.add('error');
                setTimeout(() => {
                    notification.textContent = '';
                    notification.classList.remove('error');
                }, 3000);
            });
    }

    function copyKey() {
        navigator.clipboard.writeText(generatedKey.textContent)
            .then(() => {
                notification.textContent = 'Key copied!';
                notification.classList.add('success');
                setTimeout(() => {
                    notification.textContent = '';
                    notification.classList.remove('success');
                }, 3000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                notification.textContent = 'Error copying key';
                notification.classList.add('error');
                setTimeout(() => {
                    notification.textContent = '';
                    notification.classList.remove('error');
                }, 3000);
            });
    }
});