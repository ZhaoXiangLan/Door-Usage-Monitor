import React, { useEffect, useMemo, useState } from "react";

const doorColors = {
  "Door_1": {
    bg: "linear-gradient(135deg, #dbeafe, #eff6ff)",
    border: "#93c5fd",
    text: "#1d4ed8",
    badge: "#2563eb",
  },
  "Door_2": {
    bg: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
    border: "#86efac",
    text: "#15803d",
    badge: "#16a34a",
  },
  "Door_3": {
    bg: "linear-gradient(135deg, #fee2e2, #fef2f2)",
    border: "#fca5a5",
    text: "#b91c1c",
    badge: "#dc2626",
  },
  "Door_4": {
    bg: "linear-gradient(135deg, #f3e8ff, #faf5ff)",
    border: "#d8b4fe",
    text: "#7e22ce",
    badge: "#9333ea",
  },
  default: {
    bg: "linear-gradient(135deg, #e2e8f0, #f8fafc)",
    border: "#cbd5e1",
    text: "#334155",
    badge: "#475569",
  },
};

export default function DoorDashboard() {
  const [apiData, setApiData] = useState({ raw_data: [], hourly_data: [] });
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

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

      const interval = setInterval(fetchData, 3000);// Refresh every 3 seconds

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
        };
      }

      grouped[deviceName].count += 1;

      if (time > grouped[deviceName].latestTime) {
        grouped[deviceName].latestTime = time;
      }
    });

    const doors = Object.values(grouped).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    const totalEvents = raw.length;
    const totalDoors = doors.length;

    let busiestDoor = null;
    if (doors.length > 0) {
      busiestDoor = doors.reduce((max, current) =>
        current.count > max.count ? current : max
      );
    }

    return {
      doors,
      totalEvents,
      totalDoors,
      busiestDoor,
    };
  }, [apiData]);

  const maxHourlyCount = useMemo(() => {
    if (!apiData.hourly_data || apiData.hourly_data.length === 0) return 1;
    return Math.max(...apiData.hourly_data.map((item) => item.count || 0), 1);
  }, [apiData]);

  const getDoorTheme = (doorName) => {
    return doorColors[doorName] || doorColors.default;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "No data";
    return timeString.replace("T", " ");
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Door Usage Dashboard</h1>
            <p style={styles.subtitle}>
              Live door open events from your backend
            </p>
          </div>
          <div style={styles.statusBox}>
            <span
              style={{
                ...styles.statusDot,
                backgroundColor: errorText ? "#ef4444" : "#22c55e",
              }}
            />
            <span style={styles.statusText}>
              {loading ? "Loading..." : errorText ? "API Error" : "Live Data"}
            </span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingCard}>Loading dashboard...</div>
        ) : (
          <>
            {errorText && (
              <div style={styles.errorBox}>
                {errorText}
              </div>
            )}

            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Open Events</div>
                <div style={styles.summaryValue}>
                  {dashboardData.totalEvents}
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Total Doors</div>
                <div style={styles.summaryValue}>
                  {dashboardData.totalDoors}
                </div>
              </div>

              <div style={styles.summaryCard}>
                <div style={styles.summaryLabel}>Busiest Door</div>
                <div style={styles.summaryValueSmall}>
                  {dashboardData.busiestDoor
                    ? dashboardData.busiestDoor.name
                    : "No data"}
                </div>
              </div>
            </div>

            <div style={styles.mainGrid}>
              <div style={styles.panel}>
                <div style={styles.panelTitle}>Door Overview</div>
                <div style={styles.doorGrid}>
                  {dashboardData.doors.length === 0 ? (
                    <div style={styles.emptyState}>No door data found.</div>
                  ) : (
                    dashboardData.doors.map((door) => {
                      const theme = getDoorTheme(door.name);

                      return (
                        <div
                          key={door.name}
                          style={{
                            ...styles.doorCard,
                            background: theme.bg,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          <div style={styles.doorTopRow}>
                            <div
                              style={{
                                ...styles.doorBadge,
                                backgroundColor: theme.badge,
                              }}
                            >
                              {door.name}
                            </div>
                          </div>

                          <div
                            style={{
                              ...styles.doorCount,
                              color: theme.text,
                            }}
                          >
                            {door.count}
                          </div>

                          <div style={styles.doorLabel}>Open Events</div>

                          <div style={styles.divider} />

                          <div style={styles.metaRow}>
                            <span style={styles.metaTitle}>Latest Time</span>
                            <span style={styles.metaValue}>
                              {formatTime(door.latestTime)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={styles.panel}>
                <div style={styles.panelTitle}>Hourly Activity</div>

                {apiData.hourly_data.length === 0 ? (
                  <div style={styles.emptyState}>No hourly data found.</div>
                ) : (
                  <div style={styles.chartBox}>
                    {apiData.hourly_data.map((item) => {
                      const barWidth = `${(item.count / maxHourlyCount) * 100}%`;

                      return (
                        <div key={item.hour} style={styles.chartRow}>
                          <div style={styles.chartHour}>{item.hour}:00</div>
                          <div style={styles.barTrack}>
                            <div
                              style={{
                                ...styles.barFill,
                                width: barWidth,
                              }}
                            />
                          </div>
                          <div style={styles.chartCount}>{item.count}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.footerNote}>
              Backend fields used: <b>raw_data</b>, <b>hourly_data</b>,{" "}
              <b>device</b>, <b>time</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
    padding: "32px 16px",
    fontFamily: "Inter, Segoe UI, Roboto, Arial, sans-serif",
  },
  wrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  title: {
    margin: 0,
    fontSize: "2.2rem",
    color: "#0f172a",
    fontWeight: 800,
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "#475569",
    fontSize: "1rem",
  },
  statusBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "10px 16px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
  },
  statusDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  statusText: {
    fontWeight: 600,
    color: "#334155",
  },
  loadingCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    color: "#334155",
    fontSize: "1.1rem",
  },
  errorBox: {
    marginBottom: "20px",
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    padding: "14px 16px",
    fontWeight: 600,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },
  summaryLabel: {
    fontSize: "0.95rem",
    color: "#64748b",
    marginBottom: "10px",
    fontWeight: 600,
  },
  summaryValue: {
    fontSize: "2.2rem",
    fontWeight: 800,
    color: "#0f172a",
  },
  summaryValueSmall: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#0f172a",
    wordBreak: "break-word",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "24px",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0",
  },
  panelTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "18px",
  },
  doorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  doorCard: {
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  doorTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  doorBadge: {
    color: "#ffffff",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.3px",
  },
  doorCount: {
    fontSize: "3rem",
    fontWeight: 900,
    lineHeight: 1,
  },
  doorLabel: {
    marginTop: "8px",
    color: "#475569",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(100, 116, 139, 0.2)",
    margin: "16px 0",
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  metaTitle: {
    fontSize: "0.8rem",
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  metaValue: {
    fontSize: "0.92rem",
    color: "#0f172a",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  chartBox: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "70px 1fr 40px",
    alignItems: "center",
    gap: "12px",
  },
  chartHour: {
    fontWeight: 700,
    color: "#334155",
  },
  barTrack: {
    height: "14px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
  },
  chartCount: {
    textAlign: "right",
    fontWeight: 800,
    color: "#0f172a",
  },
  emptyState: {
    padding: "30px 16px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
  },
  footerNote: {
    marginTop: "18px",
    color: "#64748b",
    fontSize: "0.92rem",
    textAlign: "center",
  },
};
