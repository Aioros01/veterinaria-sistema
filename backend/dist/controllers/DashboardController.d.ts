import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class DashboardController {
    getStats(req: AuthRequest, res: Response): Promise<void>;
    getAppointmentsSummary(req: AuthRequest, res: Response): Promise<void>;
    getRevenue(req: AuthRequest, res: Response): Promise<void>;
    getPopularServices(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=DashboardController.d.ts.map