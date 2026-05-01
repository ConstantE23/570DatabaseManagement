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


code breaks website

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import StudentApp from './StudentApp';
import './index.css';

function Root()
{
  const [portal, setPortal] = useState<'staff' | 'student'>('staff');

  if (portal === 'student')
    return <StudentApp onBackToPortal={() => setPortal('staff')} />;

  return <App />;
}

createRoot(document.getElementById('root')!).render(<Root/>);


/*
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
*/







