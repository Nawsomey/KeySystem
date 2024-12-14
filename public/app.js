document.addEventListener("DOMContentLoaded", () => {
    const generateKeyBtn = document.getElementById("generateKeyBtn");
    const generatedKey = document.getElementById("generatedKey");
    const copyBtn = document.querySelector(".copy-btn");
    const notification = document.getElementById("notification");

    if (!generateKeyBtn || !generatedKey || !notification) {
        console.error("One or more required elements are missing from the page.");
        return;
    }

    generateKeyBtn.addEventListener("click", generateKey);
    copyBtn?.addEventListener("click", copyKey);

    // Fetch the key either from the URL fragment or from the session
    fetchExistingKey();

    function fetchExistingKey() {
        const key = getKeyFromUrl();
        if (key) {
            generatedKey.textContent = key;
        } else {
            // Fallback: If key isn't in URL, try to fetch it from the server
            fetch("/getKey")
                .then((response) => response.json())
                .then((data) => {
                    if (data.secretKey) {
                        generatedKey.textContent = data.secretKey;
                    } else {
                        showNotification("No key found", "error");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching existing key:", error);
                    showNotification("Error fetching key", "error");
                });
        }
    }

    function getKeyFromUrl() {
        const key = window.location.hash.substring(1); // Remove the "#" symbol
        return key || null;
    }

    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    }

    function generateKey() {
        fetch("/generateKey")
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showNotification(data.error, "error");
                } else {
                    generatedKey.textContent = data.secretKey;
                    showNotification("Key generated!", "success");
                }
            })
            .catch((error) => {
                console.error("Error generating key:", error);
                showNotification("Error generating key", "error");
            });
    }

    function copyKey() {
        navigator.clipboard
            .writeText(generatedKey.textContent)
            .then(() => {
                showNotification("Key copied!", "success");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                showNotification("Error copying key", "error");
            });
    }
});
