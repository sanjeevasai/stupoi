const STORAGE = {

    users: "student_portal_users",

    currentUser: "student_portal_current_user"

};


// Get users

function getUsers() {

    return JSON.parse(
        localStorage.getItem(STORAGE.users) || "[]"
    );

}


// Save users

function saveUsers(users) {

    localStorage.setItem(
        STORAGE.users,
        JSON.stringify(users)
    );

}


// Get logged-in user

function getCurrentUser() {

    const id =
        localStorage.getItem(STORAGE.currentUser);

    if (!id) {

        return null;

    }

    return getUsers().find(
        user => String(user.id) === String(id)
    ) || null;

}


// Update current user

function updateCurrentUser(callback) {

    const users = getUsers();

    const id =
        localStorage.getItem(STORAGE.currentUser);

    const index = users.findIndex(
        user => String(user.id) === String(id)
    );

    if (index === -1) {

        return null;

    }

    callback(users[index]);

    saveUsers(users);

    return users[index];

}


// Show signup

function showSignup() {

    document
        .getElementById("loginPanel")
        .classList
        .add("hidden");

    document
        .getElementById("signupPanel")
        .classList
        .remove("hidden");

}


// Show login

function showLogin() {

    document
        .getElementById("signupPanel")
        .classList
        .add("hidden");

    document
        .getElementById("loginPanel")
        .classList
        .remove("hidden");

}


// SIGN UP

document
    .getElementById("signupForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const username =
            document
                .getElementById("signupUsername")
                .value
                .trim();

        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("signupPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;

        }


        const users = getUsers();


        if (
            users.some(
                user => user.email === email
            )
        ) {

            alert(
                "An account with this email already exists."
            );

            return;

        }


        const newUser = {

            id: crypto.randomUUID(),

            username: username,

            email: email,

            password: password,

            timetable: [],

            attendance: [],

            subjects: [],

            notes: []

        };


        users.push(newUser);

        saveUsers(users);


        alert(
            "Account created successfully!"
        );


        event.target.reset();

        showLogin();

    });


// LOGIN

document
    .getElementById("loginForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("loginPassword")
                .value;


        const user =
            getUsers().find(
                user =>
                    user.email === email &&
                    user.password === password
            );


        if (!user) {

            alert(
                "Invalid email or password."
            );

            return;

        }


        localStorage.setItem(
            STORAGE.currentUser,
            user.id
        );


        window.location.href =
            "dashboard.html";

    });