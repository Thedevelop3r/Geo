import React from "react";
import MapCanvas from "../components/MapCanvas";
import { useGeoState } from "../state/geoState";
import type { GeoState } from '../state/geoState';

const countryStats: Record<string, { population: string; gdp: string; flagUrl: string }> = {
  Pakistan: {
    population: "240M",
    gdp: "$350B",
    flagUrl: "https://flagcdn.com/w320/pk.png"
  },
  India: {
    population: "1.4B",
    gdp: "$3.7T",
    flagUrl: "https://flagcdn.com/w320/in.png"
  },
  USA: {
    population: "331M",
    gdp: "$26.5T",
    flagUrl: "https://flagcdn.com/w320/us.png"
  }
};

const Home = () => {
  const { selectedCountry, zoom, setZoom } = useGeoState();

  const stats = selectedCountry ? countryStats[selectedCountry] : null;

  return (
    <div>
      <h1>Geo Map Game</h1>
      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setZoom(zoom * 1.2)}>Zoom In</button>
        <button onClick={() => setZoom(zoom * 0.8)}>Zoom Out</button>
      </div>
      <MapCanvas />
      {selectedCountry && stats && (
        <div style={{ marginTop: 10, border: '1px solid #ccc', padding: 10, maxWidth: 300 }}>
          <h3>{selectedCountry}</h3>
          <img src={stats.flagUrl} alt={selectedCountry + ' flag'} style={{ width: 100 }} />
          <p><strong>Population:</strong> {stats.population}</p>
          <p><strong>GDP:</strong> {stats.gdp}</p>
        </div>
      )}
    </div>
  );
};

export default Home;