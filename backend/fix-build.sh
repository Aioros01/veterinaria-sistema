#!/bin/bash

# Fix adminRoutes.ts enums
sed -i "s/'scheduled'/AppointmentStatus.SCHEDULED/g" src/routes/adminRoutes.ts
sed -i "s/'completed'/AppointmentStatus.COMPLETED/g" src/routes/adminRoutes.ts
sed -i "s/'cancelled'/AppointmentStatus.CANCELLED/g" src/routes/adminRoutes.ts
sed -i "s/'admin'/UserRole.ADMIN/g" src/routes/adminRoutes.ts
sed -i "s/'veterinarian'/UserRole.VETERINARIAN/g" src/routes/adminRoutes.ts
sed -i "s/'client'/UserRole.CLIENT/g" src/routes/adminRoutes.ts
sed -i "s/'dog'/PetSpecies.DOG/g" src/routes/adminRoutes.ts
sed -i "s/'cat'/PetSpecies.CAT/g" src/routes/adminRoutes.ts

# Fix medicineSales.ts
sed -i "s/\['admin', 'veterinarian'\]/UserRole.ADMIN, UserRole.VETERINARIAN/g" src/routes/medicineSales.ts

echo "Build fixes applied"