import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function DoorUsageDashboard() {

  // references to the canvas elements (like grabbing pins on ESP32 lol)
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {

    // store chart objects so we can destroy later (avoids duplicates)
    let lineChart;
    let barChart;

    async function loadCharts() {
      try {

        // fetch data from backend API
        const response = await fetch("http://127.0.0.1:8000/api/usage-per-hour");
        const data = await response.json();

        // separate data into labels (hours) and values (counts)
        const labels = data.map((item) => item.hour);
        const counts = data.map((item) => item.count);

        // ===== LINE CHART =====

        // get canvas context
        const lineCtx = lineChartRef.current.getContext("2d");

        // create line chart
        lineChart = new Chart(lineCtx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Door Usage Over Time",
                data: counts,
                borderWidth: 2,
                fill: false,
                tension: 0.1, // smoothness of line
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Hour",
                },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Uses",
                },
              },
            },
          },
        });

        // ===== BAR CHART =====

        // get canvas context
        const barCtx = barChartRef.current.getContext("2d");

        // create bar chart
        barChart = new Chart(barCtx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Door Usage Per Hour",
                data: counts,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Hour",
                },
              },
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Uses",
                },
              },
            },
          },
        });

      } catch (error) {
        // error if backend not running or wrong URL
        console.error("Error loading chart data:", error);
      }
    }

    // run once when page loads
    loadCharts();

    // cleanup (VERY IMPORTANT so charts don’t stack on re-render)
    return () => {
      if (lineChart) lineChart.destroy();
      if (barChart) barChart.destroy();
    };

  }, []); // empty = run once

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        margin: "30px",
      }}
    >
      {/* title */}
      <h1 style={{ marginBottom: "30px" }}>Door Usage Dashboard</h1>

      {/* ===== LINE CHART SECTION ===== */}
      <div
        style={{
          width: "90%",
          maxWidth: "900px",
          margin: "30px auto",
        }}
      >
        <h2>Door Usage Over Time</h2>

        {/* canvas where chart gets drawn */}
        <canvas
          ref={lineChartRef}
          style={{
            background: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        />
      </div>

      {/* ===== BAR CHART SECTION ===== */}
      <div
        style={{
          width: "90%",
          maxWidth: "900px",
          margin: "30px auto",
        }}
      >
        <h2>Door Usage Per Hour</h2>

        {/* canvas for bar chart */}
        <canvas
          ref={barChartRef}
          style={{
            background: "#fff",
            border: "1px solid #fff8f8",
            padding: "10px",
          }}
        />
      </div>
    </div>
  );
}

export default DoorUsageDashboard;