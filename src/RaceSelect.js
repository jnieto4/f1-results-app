import React from 'react';

function RaceSelect({ races, selectedRound, onChange }) {
  return (
    <div style={{ marginTop: '10px' }}>
      <label htmlFor="race-select">Select Race:</label>
      <select
        id="race-select"
        value={selectedRound}
        onChange={(e) => onChange(e.target.value)}
        disabled={races.length === 0}
        style={{ marginLeft: '10px' }}
      >
        <option value="">-- Select a Race --</option>
        {races.map((race) => (
          <option key={race.round} value={race.round}>
            {race.name} (Round {race.round})
          </option>
        ))}
      </select>
    </div>
  );
}

export default RaceSelect;
