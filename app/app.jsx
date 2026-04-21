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
  "Door Info",
  "Analytics",
  "Recent Events",
  "About",
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

  function formatTime(timeString) {
    if (!timeString) return "No data";
    return String(timeString).replace("T", " ");
  }

  function getDoorTheme(doorName) {
    return doorColors[doorName] || doorColors.default;
  }

  function getHourFromItem(item) {
    if (typeof item?.hour === "number") return item.hour;

    const time = item?.time || "";
    if (typeof time !== "string") return NaN;

    const match = time.match(/(?:T|\s)(\d{1,2}):/);
    if (!match) return NaN;

    return Number(match[1]);
  }

  const processedData = useMemo(() => {
    const raw = apiData.raw_data || [];
    const grouped = {};
    const hoursFound = new Set();
    const totalsByHour = {};

    raw.forEach((item) => {
      const deviceName = item.device || "Unknown Door";
      const time = item.time || "";
      const parsedHour = getHourFromItem(item);

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

      if (!Number.isNaN(parsedHour)) {
        hoursFound.add(parsedHour);
        grouped[deviceName].hourlyCounts[parsedHour] =
          (grouped[deviceName].hourlyCounts[parsedHour] || 0) + 1;

        totalsByHour[parsedHour] = (totalsByHour[parsedHour] || 0) + 1;
      }
    });

    if (Array.isArray(apiData.hourly_data)) {
      apiData.hourly_data.forEach((item) => {
        if (typeof item.hour === "number") {
          hoursFound.add(item.hour);
          if (typeof item.count === "number") {
            totalsByHour[item.hour] = item.count;
          }
        }
      });
    }

    const doors = Object.values(grouped).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    const rankedDoors = [...doors].sort((a, b) => b.count - a.count);

    const totalEvents = raw.length;
    const totalDoors = doors.length;
    const busiestDoor = rankedDoors.length ? rankedDoors[0] : null;

    const hourLabels = Array.from(hoursFound).sort((a, b) => a - b);

    const doorStats = doors.slice(0, 3).map((door) => {
      const hourValues = Object.values(door.hourlyCounts);
      const peak = hourValues.length ? Math.max(...hourValues) : door.count;

      return {
        name: door.name,
        total: door.count,
        peak,
        latest: formatTime(door.latestTime),
      };
    });

    const totalsPerHourRows = hourLabels.map((hour) => ({
      hour,
      count: totalsByHour[hour] || 0,
    }));

    return {
      doors,
      rankedDoors,
      totalEvents,
      totalDoors,
      busiestDoor,
      hourLabels,
      doorStats,
      totalsPerHourRows,
    };
  }, [apiData]);

  const chartSeries = useMemo(() => {
    const doorNames = processedData.doors
      .map((door) => door.name)
      .slice(0, 3);

    return {
      labels: processedData.hourLabels.map((hour) => `${hour}:00`),
      doorNames,
      datasets: doorNames.map((doorName) => {
        const door = processedData.doors.find((d) => d.name === doorName);
        return {
          name: doorName,
          data: processedData.hourLabels.map(
            (hour) => door?.hourlyCounts?.[hour] || 0
          ),
        };
      }),
    };
  }, [processedData]);

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
          const theme = getDoorTheme(dataset.name);

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

  const maxDoorCount = Math.max(
    ...processedData.rankedDoors.map((door) => door.count),
    1
  );

  const maxHourlyDoorValue = Math.max(
    ...chartSeries.datasets.flatMap((set) => set.data),
    1
  );

  const maxTotalHourlyValue = Math.max(
    ...processedData.totalsPerHourRows.map((row) => row.count),
    1
  );

  const renderDashboard = () => {
    return (
      <div style={styles.dashboardPage}>
        {errorText && <div style={styles.errorBox}>{errorText}</div>}

        <div style={styles.statsRow}>
          {processedData.doorStats.length === 0 ? (
            <div style={styles.emptyBigCard}>No door data found.</div>
          ) : (
            processedData.doorStats.map((door) => {
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

 const renderDoors = () => {
  return (
    <div style={styles.subPage}>
      <h1 style={styles.pageTitle}>Doors</h1>

      {/* Top: Rankings + Usage Share */}
      <div style={styles.twoColGrid}>
        <div style={styles.listPanel}>
          <div style={styles.sectionHeader}>Door Rankings</div>

          {processedData.rankedDoors.length === 0 ? (
            <div style={styles.emptyState}>No rankings found.</div>
          ) : (
            processedData.rankedDoors.map((door, index) => (
              <div style={styles.listRow} key={door.name}>
                <span>#{index + 1}</span>
                <span>{door.name}</span>
                <span>{door.count} total events</span>
              </div>
            ))
          )}
        </div>

        <div style={styles.graphCard}>
          <div style={styles.sectionHeader}>Usage Share</div>

          <div style={styles.horizontalGraphWrap}>
            {processedData.rankedDoors.map((door) => {
              const theme = getDoorTheme(door.name);
              const width = `${(door.count / maxDoorCount) * 100}%`;

              return (
                <div key={door.name} style={styles.horizontalBarRow}>
                  <div style={styles.graphDoorLabel}>{door.name}</div>
                  <div style={styles.graphTrack}>
                    <div
                      style={{
                        ...styles.graphFill,
                        width,
                        backgroundColor: theme.accent,
                      }}
                    />
                  </div>
                  <div style={styles.graphValueLabel}>{door.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Per Door Cards */}
      <div style={styles.cardGrid}>
        {processedData.doors.map((door) => {
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
              <h3 style={{ color: theme.text }}>{door.name}</h3>

              <p>Total: {door.count}</p>
              <p>Latest: {formatTime(door.latestTime)}</p>

              <div style={styles.miniBarsWrap}>
                {processedData.hourLabels.map((hour) => {
                  const value = door.hourlyCounts?.[hour] || 0;
                  const height = `${(value / maxHourlyDoorValue) * 100}%`;

                  return (
                    <div key={hour} style={styles.miniBarCol}>
                      <div style={styles.miniBarArea}>
                        <div
                          style={{
                            ...styles.miniBar,
                            height,
                            backgroundColor: theme.accent,
                          }}
                        />
                      </div>
                      <div style={styles.miniBarLabel}>{hour}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
  const renderAnalytics = () => {
    return (
      <div style={styles.subPage}>
        <h1 style={styles.pageTitle}>Analytics</h1>

        <div style={styles.analyticsGrid}>
          <div style={styles.graphCardWide}>
            <div style={styles.sectionHeader}>Hourly Comparison by Door</div>

            {processedData.hourLabels.length === 0 || chartSeries.datasets.length === 0 ? (
              <div style={styles.emptyState}>No hourly comparison data found.</div>
            ) : (
              <div style={styles.groupedBarsWrap}>
                {processedData.hourLabels.map((hour, index) => (
                  <div key={hour} style={styles.groupedHourCol}>
                    <div style={styles.groupedBarsArea}>
                      {chartSeries.datasets.map((set) => {
                        const theme = getDoorTheme(set.name);
                        const value = set.data[index] || 0;
                        const height = `${(value / maxHourlyDoorValue) * 100}%`;

                        return (
                          <div
                            key={`${set.name}-${hour}`}
                            style={{
                              ...styles.groupedBar,
                              height,
                              backgroundColor: theme.accent,
                            }}
                            title={`${set.name} at ${hour}:00 = ${value}`}
                          />
                        );
                      })}
                    </div>

                    <div style={styles.groupedHourLabel}>{hour}:00</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.graphCard}>
            <div style={styles.sectionHeader}>Total Traffic by Hour</div>

            {processedData.totalsPerHourRows.length === 0 ? (
              <div style={styles.emptyState}>No total hourly data found.</div>
            ) : (
              <div style={styles.horizontalGraphWrap}>
                {processedData.totalsPerHourRows.map((row) => {
                  const width = `${(row.count / maxTotalHourlyValue) * 100}%`;

                  return (
                    <div key={row.hour} style={styles.horizontalBarRow}>
                      <div style={styles.graphDoorLabel}>{row.hour}:00</div>
                      <div style={styles.graphTrack}>
                        <div
                          style={{
                            ...styles.graphFill,
                            width,
                            backgroundColor: "#334155",
                          }}
                        />
                      </div>
                      <div style={styles.graphValueLabel}>{row.count}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderRecentEvents = () => {
    const recent = [...(apiData.raw_data || [])].slice().reverse().slice(0, 15);

    return (
      <div style={styles.subPage}>
        <h1 style={styles.pageTitle}>Recent Events</h1>

        <div style={styles.listPanel}>
          <div style={styles.sectionHeader}>Latest Door Opens</div>

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

const renderAbout = () => {
  return (
    <div style={styles.subPage}>
      <h1 style={styles.pageTitle}>About</h1>

      <div style={styles.aboutGrid}>
        {/* About Project */}
        <div style={styles.aboutCard}>
          <div style={styles.sectionHeader}>About This Project</div>
          <p style={styles.aboutText}>
            This project visualizes and compares usage between the two main entrances of the Temple University College of Engineering building.
            Specifically, we focus on the doors located on 12th Street and the secondary entrance.
          </p>
          <p style={styles.aboutText}>
            The website displays live data that updates in real time, allowing users to see how frequently each door is used throughout the day.
          </p>
        </div>

        {/* Why */}
        <div style={styles.aboutCard}>
          <div style={styles.sectionHeader}>Why We Did This</div>
          <p style={styles.aboutText}>
            We built this project because we thought it would be both interesting and useful—and honestly, just cool to see in action.
          </p>
          <p style={styles.aboutText}>
            We were inspired by past students of Dr. Professor Obeid, who created a project that collected data from students pressing buttons.
            However, we wanted to avoid bias in the data.
          </p>
          <p style={styles.aboutText}>
            So instead of relying on user input, we used a passive data collection method so behavior stays natural.
          </p>
        </div>

        {/* Ideas */}
        <div style={styles.aboutCard}>
          <div style={styles.sectionHeader}>Concept Exploration</div>
          <p style={styles.aboutText}>We considered several approaches:</p>
          <ul style={styles.aboutList}>
            <li>Noise sensors</li>
            <li>Room occupancy tracking</li>
            <li>Door usage tracking</li>
          </ul>
          <p style={styles.aboutText}>
            Door usage gave us the best combination of simplicity, reliability, and meaningful insight.
          </p>
        </div>

        {/* How it works */}
        <div style={styles.aboutCard}>
          <div style={styles.sectionHeader}>How It Works</div>
          <p style={styles.aboutText}>
            We use reed switches, which are magnetic sensors that detect whether a door is open or closed.
          </p>
          <ul style={styles.aboutList}>
            <li>Door closed → magnet present → circuit complete</li>
            <li>Door opens → circuit changes → event triggered</li>
          </ul>

          <p style={styles.aboutText}>That signal flows through the system:</p>
          <ul style={styles.aboutList}>
            <li>ESP32 + sensors (hardware layer)</li>
            <li>Backend API (processing)</li>
            <li>MongoDB (storage)</li>
            <li>Frontend dashboard (visualization)</li>
          </ul>
        </div>

        {/* GitHub */}
        <div style={styles.aboutCard}>
          <div style={styles.sectionHeader}>Repository</div>
          <p style={styles.aboutText}>
            For more technical details, check out the GitHub repository:
          </p>
          <a
            href="https://github.com/ZhaoXiangLan/Door-Usage-Monitor"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.aboutLink}
          >
            Door Usage Monitor GitHub
          </a>
        </div>

        {/* Thanks */}
        <div style={styles.aboutCard}>
          <div style={styles.sectionHeader}>Thanks</div>
          <p style={styles.aboutText}>
            Thanks for checking out the project—we hope you found it interesting.
          </p>
        </div>
      </div>
    </div>
  );
};
  const renderPage = () => {
    if (loading && activePage === "Dashboard") {
      return <div style={styles.loadingCard}>Loading dashboard...</div>;
    }

    if (activePage === "Dashboard") return renderDashboard();
    if (activePage === "Door Info") return renderDoors();
    if (activePage === "Analytics") return renderAnalytics();
    if (activePage === "Recent Events") return renderRecentEvents();
    if (activePage === "About") return renderAbout();

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
  sectionHeader: {
    padding: "14px 16px",
    borderBottom: "2px solid #e2e8f0",
    fontWeight: 900,
    fontSize: "1rem",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
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
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  graphCard: {
    background: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
  },
  graphCardWide: {
    background: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
  },
  horizontalGraphWrap: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  horizontalBarRow: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 90px",
    gap: "12px",
    alignItems: "center",
  },
  graphDoorLabel: {
    fontWeight: 800,
    color: "#334155",
  },
  graphTrack: {
    height: "18px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  graphFill: {
    height: "100%",
    borderRadius: "999px",
  },
  graphValueLabel: {
    textAlign: "right",
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "0.92rem",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },
  infoCard: {
    boxShadow: "4px 4px 0 #94a3b8",
    padding: "16px",
  },
  infoTitle: {
    marginTop: 0,
    marginBottom: "12px",
  },
  infoText: {
    margin: "8px 0",
    fontWeight: 600,
    color: "#334155",
  },
  miniGraphTitle: {
    marginTop: "16px",
    marginBottom: "10px",
    fontWeight: 800,
    color: "#0f172a",
  },
  miniBarsWrap: {
    height: "150px",
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
  },
  miniBarCol: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    height: "100%",
  },
  miniBarArea: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "4px",
  },
  miniBar: {
    width: "100%",
    minHeight: "6px",
  },
  miniBarLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#64748b",
  },
  smallMutedText: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: 600,
  },
  analyticsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  groupedBarsWrap: {
    height: "340px",
    padding: "16px",
    display: "flex",
    alignItems: "flex-end",
    gap: "14px",
  },
  groupedHourCol: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    height: "100%",
  },
  groupedBarsArea: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: "6px",
    background:
      "repeating-linear-gradient(to top, #eef2f7 0px, #eef2f7 1px, transparent 1px, transparent 48px)",
    border: "1px solid #e2e8f0",
    padding: "8px",
  },
  groupedBar: {
    width: "22px",
    minHeight: "6px",
    borderRadius: "4px 4px 0 0",
  },
  groupedHourLabel: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#334155",
  },
  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
  },
  aboutCard: {
    background: "#ffffff",
    border: "2px solid #94a3b8",
    boxShadow: "4px 4px 0 #94a3b8",
  },
  aboutText: {
    margin: 0,
    padding: "0 16px 14px 16px",
    color: "#334155",
    fontWeight: 600,
    lineHeight: 1.45,
  },

  aboutList: {
    margin: "0 16px 12px 30px",
    color: "#334155",
    fontWeight: 600,
  },
  aboutLink: {
    display: "block",
    margin: "0 16px 14px 16px",
    color: "#2563eb",
    fontWeight: 700,
    textDecoration: "none",
},
  emptyState: {
    padding: "30px 16px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
  },
};