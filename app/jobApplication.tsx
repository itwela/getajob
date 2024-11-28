"use client"

// components/JobApplication.js
import { useState } from 'react';

const JobApplication = () => {
  const [status, setStatus] = useState('');

  const applyForJobs = async () => {
    setStatus('Applying for jobs...');

    try {
      // Make a POST request to trigger the automation
      const response = await fetch('/api/applyJobs', {
        method: 'POST',
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setStatus(data.message);
      } else {
        const errorText = await response.text();
        setStatus(`Error: ${errorText}`);
        console.error('Unexpected response:', errorText);
      }

    } catch (error) {
        setStatus('Error: Failed to apply for jobs.');
        console.error('Error applying for jobs:', error);
    }

  };

  return (
    <div>
      <h1>Job Application Automation</h1>
      <button onClick={applyForJobs}>Apply for Jobs</button>
      <p>{status}</p>
    </div>
  );
};

export default JobApplication;
