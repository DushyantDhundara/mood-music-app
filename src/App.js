import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css'; // Importing CSS for styling

function App() {
  const [healthData, setHealthData] = useState(null);
  const [mood, setMood] = useState('');
  const [music, setMusic] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:4000/get-health-data')
      .then(response => {
        setHealthData(response.data);
        analyzeMood(response.data);
      })
      .catch(error => {
        console.error('Error fetching health data:', error);
        setError('Failed to fetch health data.');
      });
  }, []);

  const analyzeMood = (data) => {
    if (data.stressLevel > 70) {
      setMood('stress');
    } else if (data.steps < 3000) {
      setMood('sad');
    } else {
      setMood('happy');
    }
  };

  useEffect(() => {
    if (mood) {
      axios.get(`http://localhost:4000/get-mood-music/${mood}`)
        .then(response => {
          if (response.data && response.data.length > 0) {
            setMusic(response.data);
          } else {
            setMusic([]);
          }
        })
        .catch(error => {
          console.error('Error fetching music:', error);
          setError('Failed to fetch music.');
        });
    }
  }, [mood]);

  return (
    <div className="App">
      <h1>Health Data & Music Recommendations</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error if any */}

      <h2>Detected Mood: {mood}</h2>

      <h3>Health Data</h3>
      {healthData && (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[{ name: 'Health Data', ...healthData }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="steps" stroke="#8884d8" />
            <Line type="monotone" dataKey="heartRate" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      )}

      <h3>Suggested Music</h3>

      {/* Spotify player cards */}
      {music.length > 0 ? (
        <div className="music-cards">
          {music.map((track) => (
            <div key={track.id} className="music-card">
              <div className="spotify-embed-container">
                <iframe
                  src={`https://open.spotify.com/embed/track/${track.id}`}
                  width="100%"
                  height="380"
                  frameBorder="0"
                  allow="encrypted-media"
                  title={track.name}
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No music available for the current mood.</p>
      )}
    </div>
  );
}

export default App;