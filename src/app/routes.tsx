import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { TextInteractive } from '../pages/TextInteractive';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/text" element={<TextInteractive />} />
    </Routes>
  );
}
