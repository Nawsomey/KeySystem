document.addEventListener("DOMContentLoaded", () => {
    const generateKeyBtn = document.getElementById("generateKeyBtn");
    const generatedKey = document.getElementById("generatedKey");
    const copyBtn = document.querySelector(".copy-btn");
    const notification = document.getElementById("notification");

    // Add event listeners
    generateKeyBtn.addEventListener("click", generateKey);
    copyBtn.addEventListener("click", copyKey);

    // Fetch the existing key on page load
    fetchExistingKey();

    // Fetch and display the existing key, if any
    function fetchExistingKey() {
        fetch("/getKey")
            .then((response) => response.json())
            .then((data) => {
                if (data.secretKey) {
                    generatedKey.textContent = data.secretKey;
                    generateKeyBtn.disabled = true; // Disable the button if a key exists
                    showNotification(
                        "You already have a generated key.",
                        "info",
                    );
                }
            })
            .catch((error) => {
                console.error("Error fetching existing key:", error);
                showNotification(
                    "Error fetching key. Please try again.",
                    "error",
                );
            });
    }

    // Generate a new key
    function generateKey() {
        fetch("/generateKey")
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showNotification(data.error, "error");
                } else {
                    generatedKey.textContent = data.secretKey;
                    generateKeyBtn.disabled = true; // Disable the button after generating a key
                    showNotification("Key generated successfully!", "success");
                }
            })
            .catch((error) => {
                console.error("Error generating key:", error);
                showNotification(
                    "Error generating key. Please try again.",
                    "error",
                );
            });
    }

    // Copy the key to clipboard
    function copyKey() {
        const key = generatedKey.textContent;
        if (!key) {
            showNotification("No key to copy!", "error");
            return;
        }

        navigator.clipboard
            .writeText(key)
            .then(() => {
                showNotification("Key copied to clipboard!", "success");
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                showNotification(
                    "Error copying key. Please try again.",
                    "error",
                );
            });
    }

    // Display notifications
    function showNotification(message, type) {
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    }
});
