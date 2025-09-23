"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Endpoint simple que mantiene el servidor activo
router.get('/keep-alive', (req, res) => {
    res.status(200).json({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'veterinaria-backend'
    });
});
exports.default = router;
//# sourceMappingURL=keepAlive.js.map