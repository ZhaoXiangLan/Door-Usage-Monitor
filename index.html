<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Door Usage Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 30px;
        }

        h1 {
            margin-bottom: 30px;
        }

        .chart-container {
            width: 90%;
            max-width: 900px;
            margin: 30px auto;
        }

        canvas {
            background: #fff;
            border: 1px solid #ccc;
            padding: 10px;
        }
    </style>
</head>
<body>
    <h1>Door Usage Dashboard</h1>

    <div class="chart-container">
        <h2>Door Usage Over Time</h2>
        <canvas id="lineChart"></canvas>
    </div>

    <div class="chart-container">
        <h2>Door Usage Per Hour</h2>
        <canvas id="barChart"></canvas>
    </div>

    <script>
        async function loadCharts() {
            const response = await fetch("/api/data")

            if (!response.ok) {
                console.error("Failed to fetch data:", response.statusText);
                return;
            }

            const data = await response.json();
            const hourlyData = data.hourly_data;

            if (!hourlyData) {
                throw new Error("hourly_data is missing");
            }
            
            const labels = hourlyData.map(item => item.hour);
            const counts = hourlyData.map(item => item.count);
            const lineCtx = document.getElementById("lineChart").getContext("2d");
            new Chart(lineCtx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Door Usage Over Time",
                        data: counts,
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Hour"
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Uses"
                            }
                        }
                    }
                }
            });

            const barCtx = document.getElementById("barChart").getContext("2d");
            new Chart(barCtx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Door Usage Per Hour",
                        data: counts,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Hour"
                            }
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Uses"
                            }
                        }
                    }
                }
            });
        }

        loadCharts();
    </script>
</body>
</html>