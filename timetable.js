const userT =
    requireLogin();


if (userT) {

    renderTimetable();

}


const dayOrder = {

    Monday: 1,

    Tuesday: 2,

    Wednesday: 3,

    Thursday: 4,

    Friday: 5,

    Saturday: 6,

    Sunday: 7

};


// Add timetable

document
    .getElementById("timetableForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const day =
                document
                    .getElementById("day")
                    .value;


            const start =
                document
                    .getElementById("start")
                    .value;


            const end =
                document
                    .getElementById("end")
                    .value;


            const subject =
                document
                    .getElementById("subject")
                    .value
                    .trim();


            if (start >= end) {

                alert(
                    "End time must be after start time."
                );

                return;

            }


            updateCurrentUser(
                user => {

                    user.timetable.push({

                        id:
                            crypto.randomUUID(),

                        day:
                            day,

                        start:
                            start,

                        end:
                            end,

                        subject:
                            subject

                    });

                }
            );


            event.target.reset();

            renderTimetable();

            showToast(
                "Class added successfully."
            );

        }
    );


// Display timetable

function renderTimetable() {

    const user =
        getCurrentUser();


    const body =
        document.getElementById(
            "timetableBody"
        );


    body.innerHTML = "";


    const timetable =
        [...user.timetable].sort(
            (a,b) =>

                dayOrder[a.day] -
                dayOrder[b.day]

                ||

                a.start.localeCompare(
                    b.start
                )
        );


    if (timetable.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >

                    No classes added yet.

                </td>

            </tr>

        `;

        return;

    }


    timetable.forEach(
        item => {

            body.innerHTML += `

                <tr>

                    <td>
                        ${item.day}
                    </td>

                    <td>
                        ${item.start}
                    </td>

                    <td>
                        ${item.end}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>

                        <button
                            class="btn danger"
                            onclick="
                                deleteClass(
                                    '${item.id}'
                                )
                            "
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `;

        }
    );

}


// Delete class

function deleteClass(id) {

    if (
        !confirm(
            "Delete this class?"
        )
    ) {

        return;

    }


    updateCurrentUser(
        user => {

            user.timetable =
                user.timetable.filter(
                    item =>
                        item.id !== id
                );

        }
    );


    renderTimetable();

    showToast(
        "Class deleted."
    );

}