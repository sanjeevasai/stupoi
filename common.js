const STORAGE = {

    users: "student_portal_users",

    currentUser: "student_portal_current_user"

};


// =============================
// USERS
// =============================

function getUsers() {

    return JSON.parse(
        localStorage.getItem(STORAGE.users) || "[]"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        STORAGE.users,
        JSON.stringify(users)
    );

}


function getCurrentUser() {

    const id =
        localStorage.getItem(
            STORAGE.currentUser
        );

    if (!id) {

        return null;

    }

    return getUsers().find(
        user =>
            String(user.id) === String(id)
    ) || null;

}


// =============================
// LOGIN PROTECTION
// =============================

function requireLogin() {

    const user = getCurrentUser();

    if (!user) {

        window.location.href =
            "index.html";

        return null;

    }

    return user;

}


// =============================
// UPDATE USER
// =============================

function updateCurrentUser(callback) {

    const users = getUsers();

    const id =
        localStorage.getItem(
            STORAGE.currentUser
        );

    const index =
        users.findIndex(
            user =>
                String(user.id) === String(id)
        );

    if (index === -1) {

        return null;

    }

    callback(users[index]);

    saveUsers(users);

    return users[index];

}


// =============================
// LOGOUT
// =============================

function logout() {

    localStorage.removeItem(
        STORAGE.currentUser
    );

    window.location.href =
        "index.html";

}


// =============================
// DATE
// =============================

function localDate() {

    const date = new Date();

    return (

        date.getFullYear()
        + "-"
        + String(
            date.getMonth() + 1
        ).padStart(2,"0")
        + "-"
        + String(
            date.getDate()
        ).padStart(2,"0")

    );

}


// =============================
// SECURITY
// =============================

function escapeHtml(text = "") {

    return String(text).replace(
        /[&<>"']/g,
        function(character) {

            return {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            }[character];

        }
    );

}


// =============================
// TOAST
// =============================

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.style.display = "block";

    setTimeout(
        () => {
            toast.style.display = "none";
        },
        2200
    );

}


// ==================================================
// PDF STORAGE USING INDEXEDDB
// ==================================================

const DB_NAME =
    "StudentPortalPDFDatabase";

const DB_VERSION = 1;

const STORE_NAME =
    "pdfFiles";


function openFileDB() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                function() {

                    const database =
                        request.result;

                    if (
                        !database.objectStoreNames
                            .contains(STORE_NAME)
                    ) {

                        database.createObjectStore(
                            STORE_NAME,
                            {
                                keyPath: "id"
                            }
                        );

                    }

                };


            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


// Save PDF

async function savePdf(pdf) {

    const database =
        await openFileDB();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readwrite"
                );

            transaction
                .objectStore(STORE_NAME)
                .put(pdf);


            transaction.oncomplete =
                () => resolve();


            transaction.onerror =
                () =>
                    reject(
                        transaction.error
                    );

        }
    );

}


// Get PDF

async function getPdf(id) {

    const database =
        await openFileDB();

    return new Promise(
        (resolve, reject) => {

            const request =
                database
                    .transaction(
                        STORE_NAME,
                        "readonly"
                    )
                    .objectStore(STORE_NAME)
                    .get(id);


            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );

}


// Delete PDF

async function deletePdf(id) {

    const database =
        await openFileDB();

    return new Promise(
        (resolve, reject) => {

            const transaction =
                database.transaction(
                    STORE_NAME,
                    "readwrite"
                );

            transaction
                .objectStore(STORE_NAME)
                .delete(id);


            transaction.oncomplete =
                () => resolve();


            transaction.onerror =
                () =>
                    reject(
                        transaction.error
                    );

        }
    );

}