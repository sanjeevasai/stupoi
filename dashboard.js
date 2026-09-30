const user = requireLogin();

if (user) {

    loadDashboard();

}


// Get day name

function dayName(date = new Date()) {

    return [

        "Sunday",

        "Monday",

        "Tuesday",

        "Wednesday",

        "Thursday",

        "Friday",

        "Saturday"

    ][date.getDay()];

}


// Convert time to minutes

function timeToMinutes(time) {

    const parts =
        time.split(":");

    const hours =
        Number(parts[0]);

    const minutes =
        Number(parts[1]);

    return hours * 60 + minutes;

}


// Today's classes

function todayClasses(user) {

    return user.timetable

        .filter(
            item =>
                item.day === dayName()
        )

        .sort(
            (a,b) =>
                a.start.localeCompare(
                    b.start
                )
        );

}


// Current class

function getCurrentClass(user) {

    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60
        + now.getMinutes();


    return user.timetable.find(
        item => {

            if (
                item.day !== dayName()
            ) {

                return false;

            }


            const start =
                timeToMinutes(
                    item.start
                );

            const end =
                timeToMinutes(
                    item.end
                );


            return (
                currentMinutes >= start &&
                currentMinutes < end
            );

        }
    );

}


// Load dashboard

function loadDashboard() {

    const user =
        getCurrentUser();

    if (!user) return;


    document
        .getElementById("username")
        .textContent =
        user.username;


    // ==========================
    // ATTENDANCE STATISTICS
    // ==========================

    const total =
        user.attendance.length;

    const present =
        user.attendance.filter(
            item =>
                item.status === "Present"
        ).length;

    const absent =
        total - present;


    const percentage =
        total === 0
            ? 0
            : (present / total) * 100;


    document
        .getElementById("totalClasses")
        .textContent =
        total;


    document
        .getElementById("presentClasses")
        .textContent =
        present;


    document
        .getElementById("absentClasses")
        .textContent =
        absent;


    document
        .getElementById("attendancePercentage")
        .textContent =
        percentage.toFixed(1) + "%";


    // ==========================
    // CURRENT CLASS
    // ==========================

    const current =
        getCurrentClass(user);

    const currentBox =
        document.getElementById(
            "currentClass"
        );


    if (!current) {

        currentBox.innerHTML = `

            <div class="empty">

                No class is currently scheduled.

            </div>

        `;

    }

    else {

        const alreadyMarked =
            user.attendance.find(
                item =>
                    item.date === localDate() &&
                    item.subject === current.subject &&
                    item.start === current.start
            );


        currentBox.innerHTML = `

            <div class="current-subject">

                ${escapeHtml(
                    current.subject
                )}

            </div>

            <p class="muted">

                ${current.start}
                -
                ${current.end}

            </p>

            <br>

            ${
                alreadyMarked

                ?

                `

                <span
                    class="badge ${
                        alreadyMarked.status === "Present"
                        ? "present"
                        : "absent"
                    }"
                >

                    ${alreadyMarked.status}

                </span>

                `

                :

                `

                <div class="actions">

                    <button
                        class="btn success"
                        onclick="
                            markAttendance('Present')
                        "
                    >
                        ✓ Mark Present
                    </button>

                    <button
                        class="btn danger"
                        onclick="
                            markAttendance('Absent')
                        "
                    >
                        ✕ Mark Absent
                    </button>

                </div>

                `
            }

        `;

    }


    // ==========================
    // TODAY TABLE
    // ==========================

    const table =
        document.getElementById(
            "todayTable"
        );

    table.innerHTML = "";


    const classes =
        todayClasses(user);


    if (classes.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="empty"
                >

                    No classes today.

                </td>

            </tr>

        `;

    }


    classes.forEach(
        classItem => {

            const marked =
                user.attendance.find(
                    item =>
                        item.date === localDate() &&
                        item.subject === classItem.subject &&
                        item.start === classItem.start
                );


            table.innerHTML += `

                <tr>

                    <td>

                        ${classItem.start}
                        -
                        ${classItem.end}

                    </td>

                    <td>

                        ${escapeHtml(
                            classItem.subject
                        )}

                    </td>

                    <td>

                        ${
                            marked

                            ?

                            `

                            <span
                                class="badge ${
                                    marked.status === "Present"
                                    ? "present"
                                    : "absent"
                                }"
                            >

                                ${marked.status}

                            </span>

                            `

                            :

                            `

                            <span
                                class="badge neutral"
                            >
                                Not Marked
                            </span>

                            `
                        }

                    </td>

                </tr>

            `;

        }
    );


    // ==========================
    // RECENT NOTES
    // ==========================

    const recentNotes =
        document.getElementById(
            "recentNotes"
        );


    const notes =
        [...user.notes]

        .sort(
            (a,b) =>
                b.createdAt -
                a.createdAt
        )

        .slice(0,5);


    if (notes.length === 0) {

        recentNotes.innerHTML = `

            <div class="empty">

                No notes created yet.

            </div>

        `;

    }

    else {

        recentNotes.innerHTML =
            notes.map(
                note => `

                <div class="note-item">

                    <div>

                        <h3>
                            📄
                            ${escapeHtml(
                                note.title
                            )}
                        </h3>

                        <small>

                            ${escapeHtml(
                                note.subject
                            )}

                        </small>

                    </div>

                    <a
                        class="btn secondary"
                        href="
                            notes.html?subject=
                            ${encodeURIComponent(
                                note.subject
                            )}
                        "
                    >
                        Open
                    </a>

                </div>

                `
            ).join("");

    }

}


// ==========================
// MARK ATTENDANCE
// ==========================

function markAttendance(status) {

    const user =
        getCurrentUser();

    const current =
        getCurrentClass(user);


    if (!current) {

        return;

    }


    const existing =
        user.attendance.find(
            item =>
                item.date === localDate() &&
                item.subject === current.subject &&
                item.start === current.start
        );


    if (existing) {

        alert(
            "Attendance is already marked."
        );

        return;

    }


    updateCurrentUser(
        user => {

            user.attendance.push({

                id:
                    crypto.randomUUID(),

                date:
                    localDate(),

                subject:
                    current.subject,

                start:
                    current.start,

                end:
                    current.end,

                status:
                    status

            });

        }
    );


    showToast(
        "Attendance marked as " +
        status
    );


    loadDashboard();

}


// Refresh every minute

loadDashboard();

setInterval(
    loadDashboard,
    60000
);