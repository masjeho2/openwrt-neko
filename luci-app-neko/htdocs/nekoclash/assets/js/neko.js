document.addEventListener('DOMContentLoaded', function () {
    var pth = window.location.pathname; 
    
    if (pth === "/nekoclash/settings.php"){
        const cliver = document.getElementById('cliver');
        const mihomover = document.getElementById('mihomover');
        const singboxver = document.getElementById('singboxver');

        if (cliver && mihomover && singboxver) {
            fetch("./lib/log.php?data=neko_ver")
                .then(response => response.text())
                .then(result => {
                    cliver.innerHTML = result;
                });
            fetch("./lib/log.php?data=mihomo_ver")
                .then(response => response.text())
                .then(result => {
                    mihomover.innerHTML = result;
                });
            fetch("./lib/log.php?data=singbox_ver")
                .then(response => response.text())
                .then(result => {
                    singboxver.innerHTML = result;
                });
        }
    }
    else {
        const logs = document.getElementById("logs");
        const binLogs = document.getElementById("bin_logs");
        
        if (logs || binLogs) {
            setInterval(function() {
                if (logs) {
                    fetch("./lib/log.php?data=neko")
                        .then(response => response.text())
                        .then(result => {
                            logs.innerHTML = result;
                            logs.scrollTop = logs.scrollHeight;
                        });
                }
                if (binLogs) {
                    fetch("./lib/log.php?data=bin")
                        .then(response => response.text())
                        .then(result => {
                            binLogs.innerHTML = result;
                        });
                }
            }, 1000);
        }
    }
});

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes/1024).toFixed(2) + " KB";
    if (bytes < 1073741824) return (bytes/1048576).toFixed(2) + " MB";
    return (bytes/1073741824).toFixed(2) + " GB";
}

let labels = [];
let downloadData = [];
let uploadData = [];
let trafficChart;

function getThemeColors() {
    return {
        grid: 'rgba(160, 174, 192, 0.1)',
        text: '#718096'
    };
}

function initChart() {
    const ctx = document.getElementById('trafficChart');
    if (!ctx) return;

    trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Download',
                data: downloadData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0
            }, {
                label: 'Upload',
                data: uploadData,
                borderColor: '#16a34a',
                backgroundColor: 'rgba(22, 163, 74, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: getThemeColors().text
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getThemeColors().text
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: getThemeColors().grid,
                        borderDash: [2, 2]
                    },
                    ticks: {
                        callback: function(value) {
                            if (value === 0) return '0 B';
                            if (value < 1024) return value + ' B';
                            if (value < 1048576) return (value/1024).toFixed(0) + ' KB';
                            return (value/1048576).toFixed(0) + ' MB';
                        }
                    }
                }
            }
        }
    });
}

function updateLogs() {
    const logsCollapse = document.getElementById('logsCollapse');
    if (!logsCollapse.classList.contains('show')) return;


    fetch('./lib/log.php?data=neko')
        .then(response => response.text())
        .then(data => {
            const logs = document.getElementById('logs');
            if (logs) {
                logs.value = data;
                logs.scrollTop = logs.scrollHeight;
            }
        });

    fetch('./lib/log.php?data=bin')
        .then(response => response.text())
        .then(data => {
            const binLogs = document.getElementById('bin_logs');
            if (binLogs) {
                binLogs.value = data;
                binLogs.scrollTop = binLogs.scrollHeight;
            }
        });
}

function rateToBytes(rateStr) {
    const matches = rateStr.match(/^([\d.]+)\s*(B\/s|KB\/s|MB\/s|GB\/s)$/);
    if (!matches) return 0;
    
    const value = parseFloat(matches[1]);
    const unit = matches[2];
    
    switch(unit) {
        case 'GB/s': return value * 1024 * 1024 * 1024;
        case 'MB/s': return value * 1024 * 1024;
        case 'KB/s': return value * 1024;
        case 'B/s': return value;
        default: return 0;
    }
}

function updateStats() {
    fetch('./lib/up.php')
        .then(response => response.text())
        .then(upResult => {
            const uptotal = document.getElementById('uptotal');
            if (uptotal) uptotal.textContent = upResult;

            fetch('./lib/down.php')
                .then(response => response.text())
                .then(downResult => {
                    const downtotal = document.getElementById('downtotal');
                    if (downtotal) downtotal.textContent = downResult;

                    if (trafficChart) {
                        const now = new Date();
                        const timeStr = now.getHours() + ':' + 
                                      String(now.getMinutes()).padStart(2, '0') + ':' + 
                                      String(now.getSeconds()).padStart(2, '0');

                        labels.push(timeStr);
                        downloadData.push(rateToBytes(downResult));
                        uploadData.push(rateToBytes(upResult));

                        if (labels.length > 10) {
                            labels.shift();
                            downloadData.shift();
                            uploadData.shift();
                        }

                        trafficChart.update();
                    }
                });
        });
}

function updateTotal() {
    fetch("./lib/total.php")
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-download').textContent = formatBytes(data.download);
            document.getElementById('total-upload').textContent = formatBytes(data.upload);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    initChart();
    updateTotal();
    
    setInterval(updateLogs, 1000);
    
    setInterval(updateStats, 1000);
    
    document.getElementById('logsCollapse').addEventListener('shown.bs.collapse', updateLogs);
});

