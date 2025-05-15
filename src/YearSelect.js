import React from 'react';

function YearSelect({ years, selectedYear, onChange }) {
  return (
    <div style={{ marginTop: '10px' }}>
      <label htmlFor="year-select">Select Year:</label>
      <select
        id="year-select"
        value={selectedYear}
        onChange={(e) => onChange(e.target.value)}
        style={{ marginLeft: '10px' }}
      >
        <option value="">-- Select a Year --</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

export default YearSelect;
