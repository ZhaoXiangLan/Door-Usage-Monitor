import React, { useState, useEffect } from 'react';

const DoorDashboard = () => {
  const [doorStats, setDoorStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data on component mount
  useEffect(() => {
    fetch('/api/data')
      .then((response) => {
        if (!response.ok) throw new Error('API not found');
        return response.json();
      })
      .then((data) => {
        processDoorData(data);
      })
      .catch((error) => {
        console.log("Using mock data for demonstration...");
        // Example of the required data format: [{ door: "door1", time: "..." }]
        const mockData = [
          { door: 'door1', time: '2023-10-01 08:00:00' },
          { door: 'door1', time: '2023-10-01 09:30:00' },
          { door: 'door2', time: '2023-10-01 10:00:00' },
          { door: 'door3', time: '2023-10-01 11:15:00' },
          { door: 'door2', time: '2023-10-01 12:00:00' },
          { door: 'door1', time: '2023-10-01 14:00:00' },
          { door: 'door4', time: '2023-10-01 15:00:00' },
        ];
        processDoorData(mockData);
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Logic to group data by door name and count events
  const processDoorData = (rawData) => {
    const counts = {};

    rawData.forEach((item) => {
      const doorName = item.door;
      // If the door already exists in our object, add 1. Otherwise, start at 1.
      counts[doorName] = (counts[doorName] || 0) + 1;
    });

    // Convert the object { door1: 3, door2: 2 } into an array for easy mapping in JSX
    const formattedData = Object.keys(counts).map((name) => ({
      name: name,
      count: counts[name],
    }));

    setDoorStats(formattedData);
  };

  // 3. Helper function to get soft modern colors based on door name
  const getDoorStyle = (name) => {
    const styles = {
      door1: { bg: '#EBF8FF', text: '#2B6CB0', border: '#BEE3F8' }, // Blue
      door2: { bg: '#F0FFF4', text: '#2F855A', border: '#C6F6D5' }, // Green
      door3: { bg: '#FFF5F5', text: '#C53030', border: '#FED7D7' }, // Red
      door4: { bg: '#FAF5FF', text: '#6B46C1', border: '#E9D8FD' }, // Purple
    };

    // Return the specific style, or a default gray if name doesn't match
    return styles[name] || { bg: '#F7FAFC', text: '#4A5568', border: '#E2E8F0' };
  };

  // 4. Main UI Render
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Door Usage Dashboard</h1>
      
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div style={styles.cardGrid}>
          {doorStats.map((door) => {
            const colorStyle = getDoorStyle(door.name);
            
            return (
              <div 
                key={door.name} 
                style={{
                  ...styles.card,
                  backgroundColor: colorStyle.bg,
                  color: colorStyle.text,
                  borderColor: colorStyle.border
                }}
              >
                <h2 style={styles.doorName}>{door.name.toUpperCase()}</h2>
                <div style={styles.countContainer}>
                  <span style={styles.countNumber}>{door.count}</span>
                  <span style={styles.countLabel}>Open Events</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 5. CSS-in-JS Styles
const styles = {
  container: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    color: '#1e293b',
    fontSize: '2rem',
    marginBottom: '40px',
    fontWeight: '700',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    width: '100%',
    maxWidth: '1000px',
  },
  card: {
    padding: '24px',
    borderRadius: '16px',
    borderWidth: '2px',
    borderStyle: 'solid',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    transition: 'transform 0.2s ease',
  },
  doorName: {
    margin: '0 0 10px 0',
    fontSize: '0.9rem',
    letterSpacing: '1px',
    opacity: 0.8,
  },
  countContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  countNumber: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1',
  },
  countLabel: {
    fontSize: '0.85rem',
    marginTop: '5px',
    fontWeight: '500',
  },
};

export default DoorDashboard;
