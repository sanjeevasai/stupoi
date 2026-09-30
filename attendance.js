const userA =
    requireLogin();


if (userA) {

    renderAttendance();

}


function renderAttendance() {

    const user =
        getCurrentUser();


    const attendanceBody =
        document.getElementById(
            "attendanceBody"
        );


    const historyBody =
        document.getElementById(
            "historyBody"
        );


    attendanceBody.innerHTML = "";

    historyBody.innerHTML = "";


    // Get all subjects

    const subjects =
        new Set();


    user.timetable.forEach(
        item => {

            subjects.add(
                item.subject
            );

        }
    );


    user.attendance.forEach(
        item => {

            subjects.add(
                item.subject
            );

        }
    );


    // ==========================
    // SUBJECT ATTENDANCE
    // ==========================

    if (subjects.size === 0) {

        attendanceBody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty"
                >

                    Add timetable classes first.

                </td>

            </tr>

        `;

    }


    [...subjects]
        .sort()
        .forEach(
            subject => {

                const records =
                    user.attendance.filter(
                        item =>
                            item.subject ===
                            subject
                    );


                const total =
                    records.length;


                const present =
                    records.filter(
                        item =>
                            item.status ===
                            "Present"
                    ).length;


                const absent =
                    total - present;


                const percentage =
                    total === 0
                        ? 0
                        : (
                            present /
                            total
                        ) * 100;


                attendanceBody.innerHTML += `

                    <tr>

                        <td>
                            ${escapeHtml(
                                subject
                            )}
                        </td>

                        <td>
                            ${total}
                        </td>

                        <td>
                            ${present}
                        </td>

                        <td>
                            ${absent}
                        </td>

                        <td>

                            <strong>
                                ${percentage.toFixed(1)}%
                            </strong>

                        </td>

                    </tr>

                `;

            }
        );


    // ==========================
    // HISTORY
    // ==========================

    const history =
        [...user.attendance].sort(
            (a,b) => {

                return (
                    b.date.localeCompare(
                        a.date
                    )
                    ||
                    b.start.localeCompare(
                        a.start
                    )
                );

            }
        );


    if (history.length === 0) {

        historyBody.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty"
                >

                    No attendance records yet.

                </td>

            </tr>

        `;

    }


    history.forEach(
        item => {

            historyBody.innerHTML += `

                <tr>

                    <td>
                        ${item.date}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.subject
                        )}
                    </td>

                    <td>
                        ${item.start}
                        -
                        ${item.end}
                    </td>

                    <td>

                        <span
                            class="badge ${
                                item.status ===
                                "Present"
                                ? "present"
                                : "absent"
                            }"
                        >

                            ${item.status}

                        </span>

                    </td>

                </tr>

            `;

        }
    );

}