/*
Author: Makaila Williams
Course: CSC-570-01
Des: Guide for user to determine which portal

AI Disclosure: Claude AI (Anthropic) was used during the debugging process
of this file. While troubleshooting a 500 server error caused by changes
made to main.tsx and StudentApp.tsx, Claude was used to identify the issue and suggest fixes.
All original code structure, logic, and design decisions were developed
by the myself prior to AI assistance. As of 4/30/2026 4:34 it still unknown as to 
why my new code for main.tsx breaks the demo website AI assistance could not 
help with that.

APA Citation:
Anthropic. (2026). Claude (Version Sonnet 4.6) [Large language model].
https://www.anthropic.com

*/

/*
code breaks website

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
 (
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
*/

//code that does not break but is not ideal
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import StudentApp from './StudentApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StudentApp />
  </StrictMode>,
);








