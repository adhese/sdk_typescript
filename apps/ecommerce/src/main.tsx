import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

async function enableMocking() {
  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('app')!).render(
    <App />,
  );
});
