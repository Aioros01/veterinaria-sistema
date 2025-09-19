import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AppointmentController {
    private appointmentRepository;
    create(req: AuthRequest, res: Response): Promise<void>;
    getMyAppointments(req: AuthRequest, res: Response): Promise<void>;
    getCalendar(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    updateStatus(req: AuthRequest, res: Response): Promise<void>;
    cancel(req: AuthRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AppointmentController.d.ts.map