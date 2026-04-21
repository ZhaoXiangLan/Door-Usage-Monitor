import React, { useEffect, useMemo, useState } from "react";
import Chart from "chart.js/auto";

const doorColors = {
  Door_1: {
    border: "#93c5fd",
    text: "#1d4ed8",
    accent: "#2563eb",
    bg: "#eff6ff",
  },
  Door_2: {
    border: "#86efac",
    text: "#15803d",
    accent: "#16a34a",
    bg: "#f0fdf4",
  },
  Door_3: {
    border: "#fca5a5",
    text: "#b91c1c",
    accent: "#dc2626",
    bg: "#fef2f2",
  },
  Door_4: {
    border: "#d8b4fe",
    text: "#7e22ce",
    accent: "#9333ea",
    bg: "#faf5ff",
  },
  default: {
    border: "#cbd5e1",
    text: "#334155",
    accent: "#475569",
    bg: "#f8fafc",
  },
};

const sidebarItems = [
  "Dashboard",
  "Door Rankings",
  "Per Door",
  "Hourly Breakdown",
  "Recent Events",
];

export default function App() {
  const [apiData, setApiData] = useState({ raw_data: [], hourly_data: [] });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [activePage, setActivePage] = useState("Dashboard");

  const chartRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/data")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to load API data");
          }
          return res.json();
        })
        .then((data) => {
          setApiData({
            raw_data: Array.isArray(data.raw_data) ? data.raw_data : [],
            hourly_data: Array.isArray(data.hourly_data) ? data.hourly_data : [],
          });
          setErrorText("");
        })
        .catch((err) => {
          console.error(err);
          setErrorText("Could not load live data.");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const dashboardData = useMemo(() => {
    const raw = apiData.raw_data || [];
    const grouped = {};

    raw.forEach((item) => {
      const deviceName = item.device || "Unknown Door";
      const time = item.time || "";

      if (!grouped[deviceName]) {
        grouped[deviceName] = {
          name: deviceName,
          count: 0,
          latestTime: time,
          hourlyCounts: {},
        };
      }

      grouped[deviceName].count += 1;

      if (time > grouped[deviceName].latestTime) {
        grouped[deviceName].latestTime = time;
      }

      const parsedHour =
        typeof item.hour === "number"
          ? item.hour
          : typeof time === "string" && time.includes(":")
          ? Number(time.split("T")[1]?.split(":")[0] ?? time.split(" ")[1]?.split(":")[0])
          : NaN;

      if (!Number.isNaN(parsedHour)) {
        grouped[deviceName].hourlyCounts[parsedHour] =
          (grouped[deviceName].hourlyCounts[parsedHour] || 0) + 1;
      }
    });

    const doors = Object.values(grouped).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    const totalEvents = raw.length;
    const totalDoors = doors.length;
    const busiestDoor =
      doors.length > 0
        ? doors.reduce((max, current) => (current.count > max.count ? current : max))
        : null;

    const rankedDoors = [...doors].sort((a, b) => b.count - a.count);

    const doorStats = doors.slice(0, 3).map((door) => {
      const hourValues = Object.values(door.hourlyCounts);
      const peak = hourValues.length ? Math.max(...hourValues) : door.count;
      const latest = formatTime(door.latestTime);

      return {
        name: door.name,
        total: door.count,
        peak,
        latest,
      };
    });

    return {
      doors,
      totalEvents,
      totalDoors,
      busiestDoor,
      rankedDoors,
      doorStats,
    };
  }, [apiData]);

  const chartSeries = useMemo(() => {
    const raw = apiData.raw_data || [];
    const groupedByDoor = {};

    raw.forEach((item) => {
      const deviceName = item.device || "Unknown Door";
      const time = item.time || "";

      const parsedHour =
        typeof item.hour === "number"
          ? item.hour
          : typeof time === "string" && time.includes(":")
          ? Number(time.split("T")[1]?.split(":")[0] ?? time.split(" ")[1]?.split(":")[0])
          : NaN;

      if (Number.isNaN(parsedHour)) return;

      if (!groupedByDoor[deviceName]) {
        groupedByDoor[deviceName] = {};
      }

      groupedByDoor[deviceName][parsedHour] =
        (groupedByDoor[deviceName][parsedHour] || 0) + 1;
    });

    let hourLabels = [];

    if (apiData.hourly_data?.length) {
      hourLabels = apiData.hourly_data
        .map((item) => item.hour)
        .filter((hour) => typeof hour === "number")
        .sort((a, b) => a - b);
    }

    if (!hourLabels.length) {
      const foundHours = new Set();
      Object.values(groupedByDoor).forEach((doorMap) => {
        Object.keys(doorMap).forEach((hour) => foundHours.add(Number(hour)));
      });
      hourLabels = Array.from(foundHours).sort((a, b) => a - b);
    }

    const doorNames = Object.keys(groupedByDoor)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .slice(0, 3);

    return {
      labels: hourLabels.map((hour) => `${hour}:00`),
      doorNames,
      datasets: doorNames.map((doorName) => ({
        name: doorName,
        data: hourLabels.map((hour) => groupedByDoor[doorName]?.[hour] || 0),
      })),
    };
  }, [apiData]);

  useEffect(() => {
    if (activePage !== "Dashboard") return;
    if (!chartRef.current) return;
    if (!chartSeries.labels.length || !chartSeries.datasets.length) return;

    const ctx = chartRef.current.getContext("2d");

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartSeries.labels,
        datasets: chartSeries.datasets.map((dataset) => {
          const theme = doorColors[dataset.name] || doorColors.default;

          return {
            label: dataset.name,
            data: dataset.data,
            borderColor: theme.accent,
            backgroundColor: theme.accent,
            tension: 0.3,
            fill: false,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Time",
            },
            grid: {
              color: "#e2e8f0",
            },
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Usage Count",
            },
            ticks: {
              precision: 0,
            },
            grid: {
              color: "#e2e8f0",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [activePage, chartSeries]);

  function formatTime(timeString) {
    if (!timeString) return "No data";
    return timeString.replace("T", " ");
  }

  function getDoorTheme(doorName) {
    return doorColors[doorName] || doorColors.default;
  }

  const renderDashboard = () => {
    return (
      <div style={styles.dashboardPage}>
        {errorText && <div style={styles.errorBox}>{errorText}</div>}

        <div style={styles.statsRow}>
          {dashboardData.doorStats.length === 0 ? (
            <div style={styles.emptyBigCard}>No door data found.</div>
          ) : (
            dashboardData.doorStats.map((door) => {
              const theme = getDoorTheme(door.name);

              return (
                <div
                  key={door.name}
                  style={{
                    ...styles.statCard,
                    backgroundColor: theme.bg,
                    border: `2px solid ${theme.border}`,
                  }}
                >
                  <div style={{ ...styles.statDoorName, color: theme.text }}>
                    {door.name}
                  </div>

                  <div style={styles.doorMetaRow}>
                    <span style={styles.metaLabel}>Total Usage</span>
                    <span style={{ ...styles.metaNumber, color: theme.text }}>
                      {door.total}
                    </span>
                  </div>

                  <div style={styles.doorMetaRow}>
                    <span style={styles.metaLabel}>Peak Hour Usage</span>
                    <span style={{ ...styles.metaNumber, color: theme.text }}>
                      {door.peak}
                    </span>
                  </div>

                  <div style={styles.doorMetaRow}>
                    <span style={styles.metaLabel}>Latest Time</span>
                    <span style={styles.metaTime}>{door.latest}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={styles.bigChartPanel}>
          <div style={styles.panelHeaderSimple}>
            <div style={styles.panelTitle}>General Door Usage Over Time</div>
            <div style={styles.liveMiniStatus}>
              <span
                style={{
                  ...styles.statusDot,
                  backgroundColor: errorText ? "#ef4444" : "#22c55e",
                }}
              />
              <span style={styles.liveMiniText}>
                {loading ? "Loading..." : errorText ? "API Error" : "Live Data"}
              </span>
            </div>
          </div>

          {chartSeries.labels.length === 0 || chartSeries.datasets.length === 0 ? (
            <div style={styles.emptyChartState}>Not enough data for chart.</div>
          ) : (
            <div style={styles.chartCanvasWrap}>
              <canvas ref={chartRef} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDoorRankings = () => {
    return (
      <div style={styles.subPage}>
        <h1 style={styles.pageTitle}>Door Rankings</h1>
        <div style={styles.listPanel}>
          {dashboardData.rankedDoors.length === 0 ? (
            <div style={styles.emptyState}>No rankings found.</div>
          ) : (
            dashboardData.rankedDoors.map((door, index) => (
              <div style={styles.listRow} key={door.name}>
                <span>#{index + 1}</span>
                <span>{door.name}</span>
                <span>{door.count} total events</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderPerDoor = () => {
    return (
      <div style={styles.subPage}>
        <h1 style={styles.pageTitle}>Per Door</h1>
        <div style={styles.cardGrid}>
          {dashboardData.doors.length === 0 ? (
            <div style={styles.emptyState}>No door data found.</div>
          ) : (
            dashboardData.doors.map((door) => {
              const theme = getDoorTheme(door.name);

              return (
                <div
                  key={door.name}
                  style={{
                    ...styles.infoCard,
                    backgroundColor: theme.bg,
                    border: `2px solid ${theme.border}`,
                  }}
                >
                  <h3 style={{ ...styles.infoTitle, color: theme.text }}>{door.name}</h3>
                  <p>Total opens: {door.count}</p>
                  <p>Latest event: {formatTime(door.latestTime)}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderHourlyBreakdown = () => {
    return (
      <div style={styles.subPage}>
        <h1 style={styles.pageTitle}>Hourly Breakdown</h1>
        <div style={styles.listPanel}>
          {apiData.hourly_data.length === 0 ? (
            <div style={styles.emptyState}>No hourly data found.</div>
          ) : (
            apiData.hourly_data.map((item) => (
              <div style={styles.listRow} key={item.hour}>
                <span>{item.hour}:00</span>
                <span>{item.count} opens</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderRecentEvents = () => {
    const recent = [...(apiData.raw_data || [])].slice().reverse();

    return (
      <div style={styles.subPage}>
        <h1 style={styles.pageTitle}>Recent Events</h1>
        <div style={styles.listPanel}>
          {recent.length === 0 ? (
            <div style={styles.emptyState}>No recent events found.</div>
          ) : (
            recent.map((item, index) => (
              <div
                style={styles.listRow}
                key={`${item.device || "Unknown"}-${item.time || index}-${index}`}
              >
                <span>{item.device || "Unknown Door"}</span>
                <span>{formatTime(item.time || "")}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (loading && activePage === "Dashboard") {
      return <div style={styles.loadingCard}>Loading dashboard...</div>;
    }

    if (activePage === "Dashboard") return renderDashboard();
    if (activePage === "Door Rankings") return renderDoorRankings();
    if (activePage === "Per Door") return renderPerDoor();
    if (activePage === "Hourly Breakdown") return renderHourlyBreakdown();
    if (activePage === "Recent Events") return renderRecentEvents();

    return renderDashboard();
  };

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarBrand}>DOOR UI</div>

        <div style={styles.sidebarMenu}>
          {sidebarItems.map((item) => (
            <button
              key={item}
              style={{
                ...styles.sidebarBtn,
                ...(activePage === item ? styles.sidebarBtnActive : {}),
              }}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      <main style={styles.mainContent}>{renderPage()}</main>
    </div>
  );
}

const styles = {
  appShell: {
    display: "flex",
    width: "100%",
    height: "100vh",
    overflow: "hidden",
    background: "#dfe6ee",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
  },
  sidebar: {
    width: "220px",
    background: "linear-gradient(180deg, #14532d, #1f7a45)",
    color: "#ffffff",
    padding: "18px 14px",
    borderRight: "3px solid #0f3f22",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    flexShrink: 0,
  },
  sidebarBrand: {
    fontSize: "1.5rem",
    fontWeight: 900,
    letterSpacing: "1px",
    padding: "10px 8px",
    border: "2px solid rgba(255, 255, 255, 0.35)",
    background: "rgba(255, 255, 255, 0.08)",
    textAlign: "center",
  },
  sidebarMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sidebarBtn: {
    width: "100%",
    border: "2px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.08)",
    color: "#ffffff",
    padding: "12px 10px",
    textAlign: "left",
    fontWeight: 700,
    cursor: "pointer",
    borderRadius: 0,
    transition: "0.15s ease",
  },
  sidebarBtnActive: {
    background: "#ffffff",
    color: "#14532d",
    borderColor: "#ffffff",
  },
  mainContent: {
    flex: 1,
    height: "100vh",
    overflow: "hidden",
    padding: "18px",
  },
  dashboardPage: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  subPage: {
    width: "100%",
    height: "100%",
    overflow: "auto",
    paddingRight: "6px",
  },
  loadingCard: {
    backgroundColor: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
    padding: "40px",
    textAlign: "center",
    color: "#334155",
    fontSize: "1.1rem",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "14px 16px",
    fontWeight: 600,
  },
  statsRow: {
    minHeight: "190px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "14px",
  },
  statCard: {
    boxShadow: "4px 4px 0 #94a3b8",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  statDoorName: {
    fontSize: "1.4rem",
    fontWeight: 900,
    marginBottom: "18px",
  },
  doorMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 0",
    borderTop: "1px solid #dbe2ea",
    alignItems: "center",
  },
  metaLabel: {
    fontWeight: 700,
    color: "#475569",
    fontSize: "0.95rem",
  },
  metaNumber: {
    fontWeight: 900,
    fontSize: "1.05rem",
  },
  metaTime: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: "0.92rem",
    textAlign: "right",
    wordBreak: "break-word",
  },
  bigChartPanel: {
    flex: 1,
    minHeight: 0,
    background: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
  },
  panelHeaderSimple: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
    borderBottom: "2px solid #cbd5e1",
    paddingBottom: "10px",
    flexWrap: "wrap",
  },
  panelTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  liveMiniStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    padding: "8px 12px",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  liveMiniText: {
    fontWeight: 700,
    color: "#334155",
  },
  chartCanvasWrap: {
    flex: 1,
    minHeight: 0,
    position: "relative",
  },
  emptyChartState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontWeight: 600,
    backgroundColor: "#f8fafc",
    border: "1px solid #dbe2ea",
  },
  emptyBigCard: {
    gridColumn: "1 / -1",
    background: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#64748b",
    minHeight: "140px",
  },
  pageTitle: {
    margin: "0 0 16px 0",
    fontSize: "2rem",
    fontWeight: 900,
  },
  listPanel: {
    background: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
  },
  listRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "14px 16px",
    borderBottom: "1px solid #cbd5e1",
    fontWeight: 700,
    flexWrap: "wrap",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  infoCard: {
    boxShadow: "4px 4px 0 #94a3b8",
    padding: "16px",
  },
  infoTitle: {
    marginTop: 0,
  },
  emptyState: {
    padding: "30px 16px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
  },
};