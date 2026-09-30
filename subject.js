// ==========================
// LOGIN + SUBJECT
// ==========================

const userS = requireLogin();


const parameters =
    new URLSearchParams(
        window.location.search
    );


const subjectId =
    parameters.get("id");


let subject;


if (userS) {

    subject =
        userS.subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject) {

        alert(
            "Subject not found."
        );

        window.location.href =
            "notes.html";

    }

    else {

        document
            .getElementById(
                "subjectTitle"
            )
            .textContent =
            subject.name;


        document
            .getElementById(
                "storageWarning"
            )
            .textContent =
            "Files are stored in this browser for this demo. Large files may use significant browser storage.";


        renderSubject();

    }

}



// ==========================
// CREATE NOTE
// ==========================

document
    .getElementById("noteForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const title =
                document
                    .getElementById(
                        "noteTitle"
                    )
                    .value
                    .trim();


            const content =
                document
                    .getElementById(
                        "noteContent"
                    )
                    .value
                    .trim();


            if (!title || !content) {

                return;

            }


            updateCurrentUser(
                user => {

                    user.notes.push({

                        id:
                            crypto.randomUUID(),

                        subjectId:
                            subjectId,

                        title:
                            title,

                        content:
                            content,

                        createdAt:
                            Date.now()

                    });

                }
            );


            event.target.reset();


            renderSubject();


            showToast(
                "Note saved successfully."
            );

        }
    );



// ==========================
// UPLOAD ANY FILE
// ==========================

document
    .getElementById("pdfForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const file =
                document
                    .getElementById(
                        "pdfFile"
                    )
                    .files[0];


            if (!file) {

                alert(
                    "Please select a file."
                );

                return;

            }


            // ==========================
            // FILE SIZE LIMIT
            // ==========================

            const maxSize =
                50 * 1024 * 1024;


            if (
                file.size >
                maxSize
            ) {

                alert(
                    "Please keep each file under 50 MB."
                );

                return;

            }


            const fileId =
                crypto.randomUUID();


            try {

                await savePdf({

                    id:
                        fileId,

                    userId:
                        userS.id,

                    subjectId:
                        subjectId,

                    name:
                        file.name,

                    size:
                        file.size,

                    type:
                        file.type ||
                        "application/octet-stream",

                    blob:
                        file,

                    createdAt:
                        Date.now()

                });


                event.target.reset();


                renderSubject();


                showToast(
                    "File uploaded successfully."
                );


            }

            catch (error) {

                console.error(
                    error
                );


                alert(
                    "Could not save the file. Browser storage may be full."
                );

            }

        }
    );



// ==========================
// DISPLAY NOTES + FILES
// ==========================

function renderSubject() {

    const user =
        getCurrentUser();


    const notes =
        user.notes

            .filter(
                note =>
                    note.subjectId ===
                    subjectId
            )

            .sort(
                (a, b) =>
                    b.createdAt -
                    a.createdAt
            );


    const notesList =
        document.getElementById(
            "notesList"
        );


    notesList.innerHTML = "";


    if (notes.length === 0) {

        notesList.innerHTML = `

            <div class="empty">

                No notes created for
                this subject yet.

            </div>

        `;

    }


    notes.forEach(
        note => {

            notesList.innerHTML += `

                <article
                    class="note-item"
                >

                    <div>

                        <h3>

                            📝
                            ${escapeHtml(
                                note.title
                            )}

                        </h3>


                        <small>

                            ${new Date(
                                note.createdAt
                            ).toLocaleString()}

                        </small>


                        <p
                            style="
                                margin-top:10px;
                                white-space:pre-wrap;
                            "
                        >

                            ${escapeHtml(
                                note.content
                            )}

                        </p>

                    </div>


                    <button
                        class="btn danger"
                        onclick="
                            removeNote(
                                '${note.id}'
                            )
                        "
                    >

                        Delete

                    </button>

                </article>

            `;

        }
    );


    renderFiles();

}



// ==========================
// DISPLAY UPLOADED FILES
// ==========================

async function renderFiles() {

    const user =
        getCurrentUser();


    const database =
        await openFileDB();


    const allFiles =
        await new Promise(
            (resolve, reject) => {

                const request =
                    database
                        .transaction(
                            "pdfFiles",
                            "readonly"
                        )
                        .objectStore(
                            "pdfFiles"
                        )
                        .getAll();


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


    const files =
        allFiles

            .filter(
                file =>

                    String(
                        file.userId
                    ) ===
                    String(
                        user.id
                    )

                    &&

                    file.subjectId ===
                    subjectId
            )

            .sort(
                (a, b) =>
                    b.createdAt -
                    a.createdAt
            );


    const fileList =
        document.getElementById(
            "pdfList"
        );


    fileList.innerHTML = "";


    if (files.length === 0) {

        fileList.innerHTML = `

            <div class="empty">

                No files uploaded yet.

            </div>

        `;

        return;

    }


    files.forEach(
        file => {

            const icon =
                getFileIcon(
                    file.name
                );


            fileList.innerHTML += `

                <div
                    class="pdf-item"
                >

                    <div>

                        ${icon}

                        <strong>

                            ${escapeHtml(
                                file.name
                            )}

                        </strong>


                        <small
                            class="muted"
                        >

                            (
                            ${formatFileSize(
                                file.size
                            )}
                            )

                        </small>

                    </div>


                    <div class="actions">


                        <button
                            class="btn secondary"
                            onclick="
                                viewFile(
                                    '${file.id}'
                                )
                            "
                        >

                            Open

                        </button>


                        <button
                            class="btn danger"
                            onclick="
                                removeFile(
                                    '${file.id}'
                                )
                            "
                        >

                            Delete

                        </button>


                    </div>

                </div>

            `;

        }
    );

}



// ==========================
// GET FILE ICON
// ==========================

function getFileIcon(fileName) {

    const extension =
        fileName
            .split(".")
            .pop()
            .toLowerCase();


    if (
        extension === "pdf"
    ) {

        return "📕";

    }


    if (
        extension === "doc" ||
        extension === "docx"
    ) {

        return "📘";

    }


    if (
        extension === "ppt" ||
        extension === "pptx"
    ) {

        return "📙";

    }


    if (
        extension === "xls" ||
        extension === "xlsx"
    ) {

        return "📗";

    }


    if (
        extension === "jpg" ||
        extension === "jpeg" ||
        extension === "png" ||
        extension === "gif"
    ) {

        return "🖼️";

    }


    if (
        extension === "zip" ||
        extension === "rar" ||
        extension === "7z"
    ) {

        return "🗜️";

    }


    if (
        extension === "txt"
    ) {

        return "📄";

    }


    if (
        extension === "java" ||
        extension === "py" ||
        extension === "js" ||
        extension === "html" ||
        extension === "css"
    ) {

        return "💻";

    }


    return "📁";

}



// ==========================
// FORMAT FILE SIZE
// ==========================

function formatFileSize(bytes) {

    if (!bytes) {

        return "0 KB";

    }


    if (
        bytes <
        1024
    ) {

        return (
            bytes +
            " Bytes"
        );

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return (
            (
                bytes /
                1024
            ).toFixed(2)
            +
            " KB"
        );

    }


    if (
        bytes <
        1024 * 1024 * 1024
    ) {

        return (
            (
                bytes /
                1024 /
                1024
            ).toFixed(2)
            +
            " MB"
        );

    }


    return (
        (
            bytes /
            1024 /
            1024 /
            1024
        ).toFixed(2)
        +
        " GB"
    );

}



// ==========================
// VIEW / OPEN FILE
// ==========================

async function viewFile(id) {

    const file =
        await getPdf(id);


    if (!file) {

        alert(
            "File not found."
        );

        return;

    }


    const url =
        URL.createObjectURL(
            file.blob
        );


    window.open(
        url,
        "_blank"
    );

}



// ==========================
// DELETE FILE
// ==========================

async function removeFile(id) {

    if (
        !confirm(
            "Delete this file?"
        )
    ) {

        return;

    }


    await deletePdf(id);


    renderFiles();


    showToast(
        "File deleted."
    );

}



// ==========================
// DELETE NOTE
// ==========================

function removeNote(id) {

    if (
        !confirm(
            "Delete this note?"
        )
    ) {

        return;

    }


    updateCurrentUser(
        user => {

            user.notes =
                user.notes.filter(
                    note =>
                        note.id !== id
                );

        }
    );


    renderSubject();


    showToast(
        "Note deleted."
    );

}