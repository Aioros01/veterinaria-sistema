import { Request, Response } from 'express';
export declare class MedicineSaleController {
    private saleRepository;
    private medicineRepository;
    private prescriptionRepository;
    private userRepository;
    private petRepository;
    createSaleFromPrescription(req: Request, res: Response): Promise<Response>;
    createDirectSale(req: Request, res: Response): Promise<Response>;
    getSales(req: Request, res: Response): Promise<Response>;
    getSalesSummary(req: Request, res: Response): Promise<Response>;
    cancelSale(req: Request, res: Response): Promise<Response>;
}
//# sourceMappingURL=MedicineSaleController.d.ts.map