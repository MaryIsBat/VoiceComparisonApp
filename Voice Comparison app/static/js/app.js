// app.js
// Frontend Logic for VoiceMatch AI

document.addEventListener("DOMContentLoaded", () => {
    // App State
    let referenceFile = null;
    let comparisonFiles = [];
    let chartInstance = null;
    
    // DOM Elements
    const refDropzone = document.getElementById("ref-dropzone");
    const refInput = document.getElementById("ref-input");
    const refFileDisplay = document.getElementById("ref-file-display");
    const refFileName = document.getElementById("ref-file-name");
    const refAudioPlayer = document.getElementById("ref-audio-player");
    
    const compDropzone = document.getElementById("comp-dropzone");
    const compInput = document.getElementById("comp-input");
    const compListContainer = document.getElementById("comp-list-container");
    const compCount = document.getElementById("comp-count");
    const compFileList = document.getElementById("comp-file-list");
    
    const btnClear = document.getElementById("btn-clear");
    const btnRun = document.getElementById("btn-run");
    const loaderOverlay = document.getElementById("loader-overlay");
    const loaderStatus = document.getElementById("loader-status");
    
    const statCount = document.getElementById("stat-count");
    const statBestScore = document.getElementById("stat-best-score");
    const statBestFile = document.getElementById("stat-best-file");
    
    const tableBody = document.getElementById("table-body");
    const chartEmptyOverlay = document.getElementById("chart-empty-overlay");
    const btnDlCsv = document.getElementById("btn-dl-csv");
    const btnDlPng = document.getElementById("btn-dl-png");
    
    const consoleLog = document.getElementById("console-log");
    const btnClearConsole = document.getElementById("btn-clear-console");

    // --- Logging Utilities ---
    function logToConsole(message, type = "system") {
        const span = document.createElement("span");
        span.className = `console-line ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        span.textContent = `[${timestamp}] ${message}`;
        
        consoleLog.appendChild(span);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    btnClearConsole.addEventListener("click", () => {
        consoleLog.innerHTML = "";
        logToConsole("Logs cleared.", "system");
    });

    // --- Setup Drag and Drop Event Listeners ---
    function setupDragAndDrop(dropzone, input, onUpload) {
        dropzone.addEventListener("click", () => input.click());
        
        dropzone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropzone.classList.add("dragover");
        });
        
        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("dragover");
        });
        
        dropzone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropzone.classList.remove("dragover");
            if (e.dataTransfer.files.length > 0) {
                onUpload(e.dataTransfer.files);
            }
        });
        
        input.addEventListener("change", () => {
            if (input.files.length > 0) {
                onUpload(input.files);
            }
        });
    }

    // --- Reference Upload Handling ---
    setupDragAndDrop(refDropzone, refInput, (files) => {
        const file = files[0];
        uploadFileToServer(file, (data) => {
            referenceFile = data.filename;
            
            // UI Update
            refFileName.textContent = file.name;
            refAudioPlayer.src = `/api/audio/${encodeURIComponent(data.filename)}`;
            refFileDisplay.classList.remove("hidden");
            
            logToConsole(`Reference audio uploaded: ${file.name}`, "success");
        });
    });

    // --- Comparison Upload Handling ---
    setupDragAndDrop(compDropzone, compInput, (files) => {
        Array.from(files).forEach(file => {
            if (comparisonFiles.includes(file.name)) {
                logToConsole(`File already in queue: ${file.name}`, "system");
                return;
            }
            
            uploadFileToServer(file, (data) => {
                comparisonFiles.push(data.filename);
                addFileToQueueUI(data.filename);
                logToConsole(`Comparison audio added: ${file.name}`, "success");
            });
        });
    });

    // --- File Upload Fetch ---
    function uploadFileToServer(file, callback) {
        logToConsole(`Uploading ${file.name}...`, "process");
        const formData = new FormData();
        formData.append("file", file);
        
        fetch("/api/upload", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(data => {
                    throw new Error(data.error || "Upload failed");
                }).catch(() => {
                    throw new Error("Upload failed");
                });
            }
            return res.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(err => {
            logToConsole(`Upload failed: ${file.name} - ${err.message}`, "error");
        });
    }

    // --- UI Queue Handling ---
    function addFileToQueueUI(filename) {
        compListContainer.classList.remove("hidden");
        compCount.textContent = comparisonFiles.length;
        
        const li = document.createElement("li");
        li.className = "file-item";
        li.dataset.filename = filename;
        
        li.innerHTML = `
            <div class="file-item-left">
                <i class="fa-solid fa-file-audio text-accent"></i>
                <span title="${filename}">${filename}</span>
            </div>
            <div class="file-item-right">
                <button class="btn-item-action btn-item-play" title="Preview Audio">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="btn-item-action btn-item-delete" title="Remove">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        
        // Listeners inside queue
        const btnPlay = li.querySelector(".btn-item-play");
        let itemAudio = null;
        
        btnPlay.addEventListener("click", () => {
            if (!itemAudio) {
                itemAudio = new Audio(`/api/audio/${encodeURIComponent(filename)}`);
                itemAudio.addEventListener("ended", () => {
                    btnPlay.innerHTML = `<i class="fa-solid fa-play"></i>`;
                });
            }
            
            if (itemAudio.paused) {
                // Pause all other audios if playing
                document.querySelectorAll("audio").forEach(a => a.pause());
                itemAudio.play();
                btnPlay.innerHTML = `<i class="fa-solid fa-pause"></i>`;
            } else {
                itemAudio.pause();
                btnPlay.innerHTML = `<i class="fa-solid fa-play"></i>`;
            }
        });
        
        li.querySelector(".btn-item-delete").addEventListener("click", () => {
            if (itemAudio) itemAudio.pause();
            comparisonFiles = comparisonFiles.filter(f => f !== filename);
            li.remove();
            compCount.textContent = comparisonFiles.length;
            
            if (comparisonFiles.length === 0) {
                compListContainer.classList.add("hidden");
            }
            logToConsole(`Removed from comparison queue: ${filename}`, "system");
        });
        
        compFileList.appendChild(li);
    }

    // --- Clear All ---
    btnClear.addEventListener("click", () => {
        referenceFile = null;
        comparisonFiles = [];
        
        // UI Reset
        refFileDisplay.classList.add("hidden");
        refAudioPlayer.src = "";
        refInput.value = "";
        
        compFileList.innerHTML = "";
        compListContainer.classList.add("hidden");
        compInput.value = "";
        
        statCount.textContent = "0";
        statBestScore.textContent = "-";
        statBestFile.textContent = "N/A";
        
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="4">
                    <i class="fa-solid fa-circle-info"></i> Upload files and run comparison to view similarity rankings.
                </td>
            </tr>
        `;
        
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
        chartEmptyOverlay.classList.remove("hidden");
        
        btnDlCsv.classList.add("disabled");
        btnDlCsv.href = "#";
        btnDlPng.classList.add("disabled");
        btnDlPng.href = "#";
        
        logToConsole("All inputs and results cleared.", "system");
    });

    // --- Run Process ---
    btnRun.addEventListener("click", () => {
        if (!referenceFile) {
            alert("Please select a Reference Voice file.");
            logToConsole("Error: Reference Voice is missing.", "error");
            return;
        }
        if (comparisonFiles.length === 0) {
            alert("Please select at least one Comparison Voice file.");
            logToConsole("Error: Comparison queue is empty.", "error");
            return;
        }

        // Show Loader
        loaderStatus.textContent = "Initializing VoiceEncoder...";
        loaderOverlay.classList.remove("hidden");
        logToConsole("Comparison job triggered. Running...", "process");

        fetch("/api/compare", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                reference: referenceFile,
                files: comparisonFiles
            })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(data => {
                    throw new Error(data.error || "Comparison failed");
                });
            }
            return res.json();
        })
        .then(data => {
            // Append process logs
            if (data.logs) {
                data.logs.split("\n").forEach(line => {
                    if (line.trim()) {
                        let type = "process";
                        if (line.includes("complete")) type = "success";
                        if (line.includes("ERROR") || line.includes("FAILED")) type = "error";
                        logToConsole(line, type);
                    }
                });
            }

            // Populate KPIs
            statCount.textContent = data.comparisons.length;
            
            let bestMatch = null;
            if (data.comparisons.length > 0) {
                bestMatch = data.comparisons.reduce((prev, current) => (prev.similarity > current.similarity) ? prev : current);
                statBestScore.textContent = bestMatch.similarity.toFixed(3);
                statBestFile.textContent = bestMatch.filename;
            } else {
                statBestScore.textContent = "-";
                statBestFile.textContent = "N/A";
            }

            // Populate Table
            populateResultsTable(data.comparisons);

            // Render Chart
            renderUmapChart(data.reference, data.comparisons, data.umap_coords);

            // Enable Downloads
            btnDlCsv.classList.remove("disabled");
            btnDlCsv.href = "/api/download/csv";
            btnDlPng.classList.remove("disabled");
            btnDlPng.href = "/api/download/png";

            loaderOverlay.classList.add("hidden");
            logToConsole("Comparison process finished successfully.", "success");
        })
        .catch(err => {
            loaderOverlay.classList.add("hidden");
            logToConsole(`Comparison job failed: ${err.message}`, "error");
            alert(`Analysis failed: ${err.message}`);
        });
    });

    // --- Populate Results Table ---
    function populateResultsTable(comparisons) {
        if (comparisons.length === 0) {
            tableBody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="4">No comparison results available.</td>
                </tr>
            `;
            return;
        }

        // Sort descending by score
        const sorted = [...comparisons].sort((a, b) => b.similarity - a.similarity);
        
        tableBody.innerHTML = "";
        sorted.forEach(item => {
            const tr = document.createElement("tr");
            
            // Percentage width
            const pct = Math.max(0, Math.min(100, item.similarity * 100));
            
            // Badge color Class
            let badgeClass = "badge-distant";
            let barColor = "var(--error)";
            if (item.status === "Near-identical voice") {
                badgeClass = "badge-identical";
                barColor = "var(--success)";
            } else if (item.status === "Similar") {
                badgeClass = "badge-similar";
                barColor = "var(--accent-light)";
            } else if (item.status === "Weak similarity") {
                badgeClass = "badge-weak";
                barColor = "var(--warning)";
            }

            tr.innerHTML = `
                <td>
                    <div class="file-name" title="${item.filename}">${item.filename}</div>
                </td>
                <td>
                    <div class="similarity-indicator">
                        <span class="sim-score-value">${item.similarity.toFixed(3)}</span>
                        <div class="sim-bar-container">
                            <div class="sim-bar-fill" style="width: ${pct}%; background: ${barColor};"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge ${badgeClass}">${item.status}</span>
                </td>
                <td>
                    <button class="btn-table-play" title="Listen">
                        <i class="fa-solid fa-play"></i>
                    </button>
                </td>
            `;

            const btnPlay = tr.querySelector(".btn-table-play");
            let rowAudio = null;

            btnPlay.addEventListener("click", () => {
                if (!rowAudio) {
                    rowAudio = new Audio(`/api/audio/${encodeURIComponent(item.filename)}`);
                    rowAudio.addEventListener("ended", () => {
                        btnPlay.innerHTML = `<i class="fa-solid fa-play"></i>`;
                        btnPlay.classList.remove("playing");
                    });
                }
                
                if (rowAudio.paused) {
                    document.querySelectorAll("audio").forEach(a => a.pause());
                    document.querySelectorAll(".btn-table-play").forEach(btn => {
                        btn.innerHTML = `<i class="fa-solid fa-play"></i>`;
                        btn.classList.remove("playing");
                    });
                    
                    rowAudio.play();
                    btnPlay.innerHTML = `<i class="fa-solid fa-pause"></i>`;
                    btnPlay.classList.add("playing");
                } else {
                    rowAudio.pause();
                    btnPlay.innerHTML = `<i class="fa-solid fa-play"></i>`;
                    btnPlay.classList.remove("playing");
                }
            });

            tableBody.appendChild(tr);
        });
    }

    // --- Render Chart.js Scatter Plot ---
    function renderUmapChart(reference, comparisons, umapCoords) {
        chartEmptyOverlay.classList.add("hidden");
        
        if (chartInstance) {
            chartInstance.destroy();
        }

        const refCoords = umapCoords[reference.filename];
        
        // Map comparison datasets
        const compPoints = comparisons.map(item => {
            const coords = umapCoords[item.filename];
            return {
                x: coords.x,
                y: coords.y,
                filename: item.filename,
                similarity: item.similarity,
                status: item.status
            };
        });

        const ctx = document.getElementById("umapChart").getContext("2d");
        
        chartInstance = new Chart(ctx, {
            type: "scatter",
            data: {
                datasets: [
                    {
                        label: "Reference Voice",
                        data: [{
                            x: refCoords.x,
                            y: refCoords.y,
                            filename: reference.filename
                        }],
                        backgroundColor: "#ef4444",
                        borderColor: "#ffffff",
                        borderWidth: 2,
                        pointRadius: 10,
                        pointHoverRadius: 12,
                        showLine: false
                    },
                    {
                        label: "Comparison Voices",
                        data: compPoints,
                        backgroundColor: "#6366f1",
                        borderColor: "#ffffff",
                        borderWidth: 1.5,
                        pointRadius: 7,
                        pointHoverRadius: 9,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            color: "#e2e8f0",
                            font: {
                                family: "Outfit",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(10, 14, 23, 0.95)",
                        titleColor: "#ffffff",
                        bodyColor: "#e2e8f0",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const p = context.raw;
                                if (p.similarity !== undefined) {
                                    return [
                                        `File: ${p.filename}`,
                                        `Similarity: ${p.similarity.toFixed(3)}`,
                                        `Status: ${p.status}`
                                    ];
                                } else {
                                    return `Reference: ${p.filename}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)"
                        },
                        ticks: {
                            color: "#94a3b8",
                            font: { family: "Outfit" }
                        },
                        title: {
                            display: true,
                            text: "UMAP Dimension 1",
                            color: "#94a3b8"
                        }
                    },
                    y: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)"
                        },
                        ticks: {
                            color: "#94a3b8",
                            font: { family: "Outfit" }
                        },
                        title: {
                            display: true,
                            text: "UMAP Dimension 2",
                            color: "#94a3b8"
                        }
                    }
                }
            }
        });
    }
});
