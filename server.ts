import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/backend/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'operational',
      system: 'TerraHaul Telematics Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth: Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
      const { name, email, password, role, siteId } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Name, email, password, and role are required' });
      }
      const user = db.createUser({ name, email, password, role, siteId });
      return res.status(201).json({
        message: 'User registered successfully',
        user,
        token: `session_${user.id}_${Date.now()}`,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed';
      return res.status(400).json({ error: errorMsg });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = db.verifyPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({
      message: 'Login successful',
      user,
      token: `session_${user.id}_${Date.now()}`,
    });
  });

  // Auth: Demo preset users list
  app.get('/api/auth/demo-users', (_req: Request, res: Response) => {
    const users = db.getUsers();
    return res.json(users);
  });

  // Fleet: Trucks List
  app.get('/api/fleet/trucks', (_req: Request, res: Response) => {
    const trucks = db.getTrucks();
    return res.json(trucks);
  });

  // Fleet: Truck Detail
  app.get('/api/fleet/trucks/:id', (req: Request, res: Response) => {
    const truck = db.getTruckById(req.params.id);
    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }
    return res.json(truck);
  });

  // Fleet: Add New Truck
  app.post('/api/fleet/trucks', (req: Request, res: Response) => {
    try {
      const truck = db.addTruck(req.body);
      return res.status(201).json(truck);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add truck';
      return res.status(400).json({ error: msg });
    }
  });

  // Fleet: Update Truck
  app.put('/api/fleet/trucks/:id', (req: Request, res: Response) => {
    try {
      const updated = db.updateTruck(req.params.id, req.body);
      return res.json(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update truck';
      return res.status(400).json({ error: msg });
    }
  });

  // Fleet: Quick Status / Cycle Update
  app.patch('/api/fleet/trucks/:id/status', (req: Request, res: Response) => {
    try {
      const { status, currentLocation, destination, currentPayloadTons, hydraulicBedAngleDeg } = req.body;
      const updated = db.updateTruck(req.params.id, {
        ...(status && { status }),
        ...(currentLocation && { currentLocation }),
        ...(destination && { destination }),
        ...(currentPayloadTons !== undefined && { currentPayloadTons }),
        ...(hydraulicBedAngleDeg !== undefined && { hydraulicBedAngleDeg }),
      });
      return res.json(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update truck status';
      return res.status(400).json({ error: msg });
    }
  });

  // Fleet: Delete Truck
  app.delete('/api/fleet/trucks/:id', (req: Request, res: Response) => {
    const success = db.deleteTruck(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Truck not found or deletion failed' });
    }
    return res.json({ message: 'Truck decommissioned successfully' });
  });

  // Dispatches
  app.get('/api/fleet/dispatches', (_req: Request, res: Response) => {
    return res.json(db.getDispatches());
  });

  app.post('/api/fleet/dispatches', (req: Request, res: Response) => {
    const dispatch = db.addDispatch(req.body);
    return res.status(201).json(dispatch);
  });

  // Alerts
  app.get('/api/fleet/alerts', (_req: Request, res: Response) => {
    return res.json(db.getAlerts());
  });

  app.post('/api/fleet/alerts', (req: Request, res: Response) => {
    const alert = db.addAlert(req.body);
    return res.status(201).json(alert);
  });

  app.patch('/api/fleet/alerts/:id/resolve', (req: Request, res: Response) => {
    const success = db.resolveAlert(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.json({ message: 'Alert resolved' });
  });

  // Stats / KPIs
  app.get('/api/fleet/stats', (_req: Request, res: Response) => {
    return res.json(db.getStats());
  });

  // Reset to initial seed state
  app.post('/api/fleet/reset', (_req: Request, res: Response) => {
    const state = db.resetToDefaults();
    return res.json({ message: 'Database reset to factory demonstration data', state });
  });

  // --- Vite Dev or Production Static Serving ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TerraHaul Engine] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
