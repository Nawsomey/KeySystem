let isKeyGenerated = localStorage.getItem('isKeyGenerated') === 'true';

function generateKey() {
    if (isKeyGenerated) {
        displayNotification('warning', 'You already have a generated key. Please use the existing key.');
        return;
    }

    $.ajax({
        url: '/generateKey',
        method: 'GET',
        success: function (data) {
            isKeyGenerated = true;
            localStorage.setItem('isKeyGenerated', 'true');
            displayNotification('success', 'Key generated successfully!');
            $('#keyInput').val(data.key);
            displayGeneratedKey(data.key);
            displayHWID(data.hwid);
        },
        error: function (error) {
            displayNotification('error', error.responseJSON ? error.responseJSON.error : 'Error generating key');
        }
    });
}

function displayHWID(hwid) {
    $('#generatedHWID').text(`HWID: ${hwid}`);
}

function validateKey() {
    const key = $('#keyInput').val();

    if (!key) {
        displayNotification('warning', 'Please enter a key');
        return;
    }

    $.ajax({
        url: `/validateKey/${key}`,
        method: 'GET',
        success: function (data) {
            if (data.valid) {
                displayNotification('success', 'Key is valid!');
            } else {
                displayNotification('warning', 'Key is invalid or expired.');
            }
        },
        error: function (error) {
            displayNotification('error', error.responseJSON ? error.responseJSON.error : 'Error validating key');
        }
    });
}

function retrieveStoredKey() {
    $.ajax({
        url: '/retrieveKey',
        method: 'GET',
        success: function (data) {
            if (data.key) {
                displayGeneratedKey(data.key);
                displayHWID(data.hwid);
            }
        },
        error: function (error) {
            displayNotification('error', error.responseJSON ? error.responseJSON.error : 'Error retrieving key');
        }
    });
}

function retrieveAndDisplayKey() {
    retrieveStoredKey();
    console.log()
}

function displayNotification(type, message) {
    const notificationDiv = $('#notification');
    notificationDiv.text(message).removeClass().addClass('notification show').addClass(type);

    setTimeout(() => notificationDiv.removeClass('show'), 3000);
}

function displayGeneratedKey(key) {
    $('#generatedKey').text(key);
}

function copyKey() {
    const generatedKey = $('#generatedKey').text();

    const textarea = document.createElement('textarea');
    textarea.value = generatedKey;

    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    displayNotification('success', 'Key copied to clipboard!');
}

$(document).ready(function () {
    if (isKeyGenerated) {
        $('#generateKeyBtn').prop('disabled', true);
        displayNotification('info', 'You already have a generated key.');
    }

    retrieveAndDisplayKey();
});
