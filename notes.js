// ========================================
// LOGIN
// ========================================

const userN = requireLogin();


// ========================================
// LOAD SUBJECTS
// ========================================

if (userN) {
    renderSubjects();
}


// ========================================
// CREATE SUBJECT
// ========================================

const subjectForm = document.getElementById("subjectForm");

if (subjectForm) {

    subjectForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const subjectInput =
            document.getElementById("subjectName");

        const name =
            subjectInput.value.trim();


        if (name === "") {
            return;
        }


        const user = getCurrentUser();


        // Check for duplicate subject
        const exists = user.subjects.some(function (subject) {

            return subject.name.toLowerCase() ===
                   name.toLowerCase();

        });


        if (exists) {

            alert("This subject already exists.");

            return;
        }


        // Create new subject
        updateCurrentUser(function (user) {

            user.subjects.push({

                id: crypto.randomUUID(),

                name: name

            });

        });


        // Clear input
        subjectInput.value = "";


        // Show subjects again
        renderSubjects();


        // Success message
        showToast("Subject created.");

    });

}


// ========================================
// DISPLAY SUBJECTS
// ========================================

function renderSubjects() {

    const user = getCurrentUser();


    const container =
        document.getElementById("subjectCards");


    if (!container) {
        return;
    }


    // Clear old subjects
    container.innerHTML = "";


    const subjects =
        user.subjects || [];


    // ====================================
    // NO SUBJECTS
    // ====================================

    if (subjects.length === 0) {

        const emptyMessage =
            document.createElement("div");

        emptyMessage.className =
            "panel empty";

        emptyMessage.textContent =
            "No subjects yet. Create subjects such as DBMS, OS, Java, CN, Maths etc.";


        container.appendChild(
            emptyMessage
        );

        return;
    }


    // ====================================
    // DISPLAY EACH SUBJECT
    // ====================================

    subjects.forEach(function (subject) {


        // -------------------------------
        // SUBJECT CARD
        // -------------------------------

        const card =
            document.createElement("div");

        card.className =
            "subject-card";

        card.style.position =
            "relative";


        // -------------------------------
        // DELETE BUTTON
        // -------------------------------

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-subject-btn";

        deleteButton.textContent =
            "🗑️";

        deleteButton.title =
            "Delete Subject";


        deleteButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                deleteSubject(
                    subject.id
                );

            }
        );


        card.appendChild(
            deleteButton
        );


        // -------------------------------
        // SUBJECT CONTENT
        // -------------------------------

        const content =
            document.createElement("div");

        content.className =
            "subject-content";

        content.style.cursor =
            "pointer";


        // Open subject when clicked
        content.addEventListener(
            "click",
            function () {

                openSubject(
                    subject.id
                );

            }
        );


        // -------------------------------
        // ICON
        // -------------------------------

        const icon =
            document.createElement("div");

        icon.className =
            "subject-icon";

        icon.textContent =
            "📚";


        content.appendChild(
            icon
        );


        // -------------------------------
        // SUBJECT NAME
        // -------------------------------

        const title =
            document.createElement("h3");

        title.textContent =
            subject.name;


        content.appendChild(
            title
        );


        // -------------------------------
        // NOTE COUNT
        // -------------------------------

        let noteCount = 0;


        if (user.notes) {

            noteCount =
                user.notes.filter(
                    function (note) {

                        return note.subjectId ===
                               subject.id;

                    }
                ).length;

        }


        const noteText =
            document.createElement("p");

        noteText.textContent =
            noteCount +
            " text note(s)";


        content.appendChild(
            noteText
        );


        // -------------------------------
        // OPEN SUBJECT BUTTON
        // -------------------------------

        const openButton =
            document.createElement("button");

        openButton.className =
            "btn secondary";

        openButton.type =
            "button";

        openButton.textContent =
            "Open Subject";


        openButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                openSubject(
                    subject.id
                );

            }
        );


        content.appendChild(
            openButton
        );


        // Add content to card
        card.appendChild(
            content
        );


        // Add card to page
        container.appendChild(
            card
        );

    });

}


// ========================================
// OPEN SUBJECT
// ========================================

function openSubject(id) {

    window.location.href =
        "subject.html?id=" +
        encodeURIComponent(id);

}


// ========================================
// DELETE SUBJECT
// ========================================

function deleteSubject(subjectId) {

    const user =
        getCurrentUser();


    // Find subject
    const subject =
        user.subjects.find(
            function (item) {

                return item.id ===
                       subjectId;

            }
        );


    // Subject not found
    if (!subject) {

        alert("Subject not found.");

        return;
    }


    // ====================================
    // COUNT NOTES
    // ====================================

    let noteCount = 0;


    if (user.notes) {

        noteCount =
            user.notes.filter(
                function (note) {

                    return note.subjectId ===
                           subjectId;

                }
            ).length;

    }


    // ====================================
    // CONFIRM DELETE
    // ====================================

    const message =
        "Are you sure you want to delete " +
        subject.name +
        "?\n\n" +
        noteCount +
        " note(s) will also be deleted.\n\n" +
        "This action cannot be undone.";


    const answer =
        confirm(message);


    if (!answer) {

        return;
    }


    // ====================================
    // DELETE SUBJECT AND NOTES
    // ====================================

    updateCurrentUser(
        function (user) {


            // Delete subject
            user.subjects =
                (user.subjects || []).filter(
                    function (item) {

                        return item.id !==
                               subjectId;

                    }
                );


            // Delete notes
            user.notes =
                (user.notes || []).filter(
                    function (note) {

                        return note.subjectId !==
                               subjectId;

                    }
                );

        }
    );


    // ====================================
    // REFRESH SUBJECTS
    // ====================================

    renderSubjects();


    // ====================================
    // SUCCESS MESSAGE
    // ====================================

    showToast(
        subject.name +
        " deleted successfully."
    );

}