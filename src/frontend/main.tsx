/*
Author: Makaila Williams
Course: CSC-570-01
Des: Guide for user to determine which portal
*/

import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import StudentApp from './StudentApp';

function Root()
{
 const [portal, setPortal] = useState <'staff' | 'student' | null > (null);
 
 //check which portal the user chose
 if (portal === 'staff')
  return <App/>;
 if(portal === 'student')
  return <StudentApp/>;

 return
 <div style={{ backgroundColor: '#0D1321', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h1 style={{ color: '#F0EBD8', fontSize: '28px', marginBottom: '8px' }}>Smart Campus</h1>
      <p style={{ color: '#748CAB', marginBottom: '40px', fontSize: '14px' }}>Select your portal to continue</p>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={() => setPortal('staff')}
          style={{ padding: '16px 32px', backgroundColor: '#3E5C76', color: '#F0EBD8', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
          Staff Portal
        </button>
        <button onClick={() => setPortal('student')}
          style={{ padding: '16px 32px', backgroundColor: '#3E5C76', color: '#F0EBD8', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
          Student Portal
        </button>
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<Root/>);









