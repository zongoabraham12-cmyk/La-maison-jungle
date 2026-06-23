import { render, screen } from '@testing-library/react';
import App from './components/App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/VENTE PROS/i);
  expect(titleElement).toBeInTheDocument();
});
