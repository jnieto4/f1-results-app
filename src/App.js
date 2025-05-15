import React, { useState, useEffect } from 'react';
import YearSelect from './YearSelect';
import RaceSelect from './RaceSelect';
import logo from './f1-logo.png';

function App() {
  const [years] = useState(
    Array.from({ length: 2024 - 1990 + 1 }, (_, i) => 1990 + i)
  );
  const [selectedYear, setSelectedYear] = useState('');
  const [races, setRaces] = useState([]);
  const [selectedRound, setSelectedRound] = useState('');
  const [raceInfo, setRaceInfo] = useState(null);  // For race location, round, date
  const [results, setResults] = useState([]);      // For race results data
  const [loading, setLoading] = useState(false);   // Loading state
  const [hoveredDriver, setHoveredDriver] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);        // Error state

  // Fetch races whenever the selectedYear changes
  useEffect(() => {
    if (!selectedYear) {
      setRaces([]);
      setSelectedRound('');
      setRaceInfo(null);
      setResults([]);
      return;
    }

    fetch(`/api/races?year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched races:", data);
        setRaces(data);
        setSelectedRound(''); // reset race selection
        setRaceInfo(null);
        setResults([]);
      })
      .catch(() => {
        setRaces([]);
        setSelectedRound('');
        setRaceInfo(null);
        setResults([]);
      });
  }, [selectedYear]);

  // Fetch results whenever selectedYear and selectedRound are both set
  useEffect(() => {
    if (!selectedYear || !selectedRound) {
      setRaceInfo(null);
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/results?year=${selectedYear}&round=${selectedRound}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch results');
        }
        return res.json();
      })
      .then((data) => {
        if (data.length === 0) {
          setRaceInfo(null);
          setResults([]);
          setError('No results found');
          setLoading(false);
          return;
        }

        // Extract race info from the first result item (all have same race info)
        const { race_name, round, date } = data[0];
        setRaceInfo({ race_name, round, date });
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching races:", err);
        setError(err.message);
        setLoading(false);
        setRaceInfo(null);
        setResults([]);
      });
  }, [selectedYear, selectedRound]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <img
        src={logo}
        alt="F1 Logo"
        style={{
          display: 'block',
          margin: '0 auto',
          height: '200px',
          objectFit: 'contain'
        }}
      />
      <h1>F1 Race Results</h1>
      <YearSelect
        years={years}
        selectedYear={selectedYear}
        onChange={setSelectedYear}
      />
      <RaceSelect
        races={races}
        selectedRound={selectedRound}
        onChange={setSelectedRound}
      />

      {/* Display race info */}
      {raceInfo && (
        <div style={{ marginTop: '20px' }}>
          <h2>{raceInfo.race_name}</h2>
          <p>
            Round: {raceInfo.round} | Date: {raceInfo.date}
          </p>
        </div>
      )}

      {/* Loading and error messages */}
      {loading && <p>Loading results...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display results table */}
      {results.length > 0 && !loading && !error && (
        <table
          style={{
            margin: '20px auto',
            borderCollapse: 'separate',
            borderSpacing: '10px',
            width: '90%',
            maxWidth: '900px',
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Finishing Place</th>
              <th style={{ textAlign: 'left' }}>Driver</th>
              <th style={{ textAlign: 'left' }}>Constructor</th>
              <th style={{ textAlign: 'left' }}>Grid</th>
              <th style={{ textAlign: 'left' }}>Position</th>
              <th style={{ textAlign: 'left' }}>Status</th>
              <th style={{ textAlign: 'left' }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, index) => (
              <tr
                key={index}
                onMouseEnter={(e) => {
                  const tooltipHeight = 200;
                  const offsetY = 10;
                  let y = e.clientY + offsetY;
                  if (e.clientY + tooltipHeight + offsetY > window.innerHeight) {
                    y = e.clientY - tooltipHeight - offsetY;
                  }
                  setTooltipPosition({ x: e.clientX + 10, y });
                  setHoveredDriver(r);
                }}
                onMouseMove={(e) => {
                  const tooltipHeight = 200;
                  const offsetY = 10;
                  let y = e.clientY + offsetY;
                  if (e.clientY + tooltipHeight + offsetY > window.innerHeight) {
                    y = e.clientY - tooltipHeight - offsetY;
                  }
                  setTooltipPosition({ x: e.clientX + 10, y });
                }}
                onMouseLeave={() => setHoveredDriver(null)}
              >
                <td>{index + 1}</td>
                <td>{r.Driver?.givenName} {r.Driver?.familyName}</td>
                <td>{r.Constructor?.name}</td>
                <td>{r.grid}</td>
                <td>{r.position || 'N/A'}</td>
                <td>{r.status}</td>
                <td>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {hoveredDriver && (
        <div
          style={{
            position: 'fixed',
            top: tooltipPosition.y - 200, // Moves it above the cursor
            left: tooltipPosition.x + 10,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 9999,
            pointerEvents: 'none',
            minWidth: '250px',        // NEW: Ensures enough width
            maxWidth: '400px',        // Optional: Prevents overly wide tooltips
            wordWrap: 'break-word',   // Prevents text from overflowing
            borderRadius: '8px',      // Optional: visual polish
          }}
        >
          <h3 style={{ marginTop: 0 }}>Driver Details</h3>
          <p><strong>Name:</strong> {hoveredDriver.Driver?.givenName} {hoveredDriver.Driver?.familyName}</p>
          <p><strong>Nationality:</strong> {hoveredDriver.Driver?.nationality}</p>
          <p><strong>Date of Birth:</strong> {hoveredDriver.Driver?.dateOfBirth}</p>
          <p><strong>Permanent Number:</strong> {hoveredDriver.Driver?.permanentNumber}</p>
          <p><strong>Constructor:</strong> {hoveredDriver.Constructor?.name}</p>
          <p><strong>Grid:</strong> {hoveredDriver.grid}</p>
          <p><strong>Laps:</strong> {hoveredDriver.laps}</p>
          <p><strong>Status:</strong> {hoveredDriver.status}</p>
          <p><strong>Fastest Lap Time:</strong> {hoveredDriver.FastestLap?.Time?.time}</p>
          <p><strong>Fastest Lap Speed:</strong> {hoveredDriver.FastestLap?.AverageSpeed?.speed} {hoveredDriver.FastestLap?.AverageSpeed?.units}</p>
        </div>
      )}



    </div>
  );
}

export default App;
