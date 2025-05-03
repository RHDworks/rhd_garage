import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { isEnvBrowser } from "./utils/misc.ts";

import GarageApp from './app/GarageApp.tsx'
import GarageDev from './components/DebugButton.tsx';

import './index.css'
import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme='dark'>
        <GarageApp/>
        <GarageDev/>
    </MantineProvider>
  </StrictMode>,
)

if (isEnvBrowser()) {
  const root = document.getElementById('root');

  // https://i.imgur.com/iPTAdYV.png - Night time img
  root!.style.backgroundImage = 'url("https://i.imgur.com/3pzRj9n.png")';
  root!.style.backgroundSize = 'cover';
  root!.style.backgroundRepeat = 'no-repeat';
  root!.style.backgroundPosition = 'center';
}