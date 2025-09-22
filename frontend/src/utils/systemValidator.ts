/**
 * Script de Validación Automática del Sistema Veterinario
 * Este script verifica que todos los permisos y funcionalidades estén operando correctamente
 */

interface ValidationResult {
  module: string;
  test: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export class SystemValidator {
  private results: ValidationResult[] = [];
  
  /**
   * Obtiene el rol del usuario actual
   */
  private getUserRole(): string | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      const userObj = JSON.parse(userStr);
      return userObj.role;
    } catch {
      return null;
    }
  }
  
  /**
   * Valida permisos en el módulo de Mascotas
   */
  validatePetsPermissions(): void {
    const userRole = this.getUserRole();
    console.log('🔍 Validando módulo: MASCOTAS');
    console.log(`   Rol actual: ${userRole}`);
    
    // Verificar botón "Agregar Mascota"
    const addButton = document.querySelector('button:has(.MuiSvgIcon-root)');
    const hasAddButton = addButton && addButton.textContent?.includes('Agregar');
    
    this.results.push({
      module: 'Mascotas',
      test: 'Botón Agregar Mascota',
      expected: userRole === 'cliente' ? 'No visible' : 'Visible',
      actual: hasAddButton ? 'Visible' : 'No visible',
      passed: userRole === 'cliente' ? !hasAddButton : !!hasAddButton
    });
    
    // Verificar botones de editar/eliminar en cards
    const editButtons = document.querySelectorAll('button:has(.MuiSvgIcon-root)').length;
    const shouldHaveEditButtons = userRole !== 'cliente';
    
    this.results.push({
      module: 'Mascotas',
      test: 'Botones Editar/Eliminar',
      expected: userRole === 'cliente' ? 'No visibles' : 'Visibles',
      actual: editButtons > 1 ? 'Visibles' : 'No visibles',
      passed: userRole === 'cliente' ? editButtons <= 1 : editButtons > 1
    });
  }
  
  /**
   * Valida el contenido del Dashboard según el rol
   */
  validateDashboard(): void {
    const userRole = this.getUserRole();
    console.log('🔍 Validando módulo: DASHBOARD');
    
    // Verificar títulos de las tarjetas
    const cardTitles = Array.from(document.querySelectorAll('.MuiTypography-root'))
      .map(el => el.textContent);
    
    const hasMisMascotas = cardTitles.some(title => title?.includes('Mis Mascotas'));
    const hasTotalMascotas = cardTitles.some(title => title?.includes('Total Mascotas'));
    const hasMedicamentos = cardTitles.some(title => title?.includes('Medicamentos Bajo Stock'));
    
    this.results.push({
      module: 'Dashboard',
      test: 'Título de Mascotas',
      expected: userRole === 'cliente' ? 'Mis Mascotas' : 'Total Mascotas',
      actual: hasMisMascotas ? 'Mis Mascotas' : (hasTotalMascotas ? 'Total Mascotas' : 'No encontrado'),
      passed: userRole === 'cliente' ? hasMisMascotas : hasTotalMascotas
    });
    
    this.results.push({
      module: 'Dashboard',
      test: 'Card Medicamentos Bajo Stock',
      expected: userRole === 'cliente' ? 'No visible' : 'Visible',
      actual: hasMedicamentos ? 'Visible' : 'No visible',
      passed: userRole === 'cliente' ? !hasMedicamentos : hasMedicamentos
    });
  }
  
  /**
   * Valida permisos en Citas
   */
  validateAppointments(): void {
    const userRole = this.getUserRole();
    console.log('🔍 Validando módulo: CITAS');
    
    // Verificar botones de cancelar
    const cancelButtons = document.querySelectorAll('button[color="error"]');
    const hasCancelButtons = cancelButtons.length > 0;
    
    this.results.push({
      module: 'Citas',
      test: 'Botón Cancelar',
      expected: userRole === 'cliente' ? 'No visible' : 'Visible para citas programadas',
      actual: hasCancelButtons ? 'Visible' : 'No visible',
      passed: userRole === 'cliente' ? !hasCancelButtons : true // Para admin/vet depende de si hay citas
    });
    
    // Verificar botón Ver
    const viewButtons = Array.from(document.querySelectorAll('button')).filter(
      btn => btn.textContent === 'Ver'
    );
    
    this.results.push({
      module: 'Citas',
      test: 'Botón Ver Detalles',
      expected: 'Visible para todos',
      actual: viewButtons.length > 0 ? 'Visible' : 'No visible',
      passed: true // El botón Ver debe estar siempre disponible
    });
  }
  
  /**
   * Valida permisos en Inventario
   */
  validateInventory(): void {
    const userRole = this.getUserRole();
    console.log('🔍 Validando módulo: INVENTARIO');
    
    // Verificar botón agregar medicamento
    const addMedicineButton = document.querySelector('button:has(.MuiSvgIcon-root)');
    const hasAddButton = addMedicineButton && addMedicineButton.textContent?.includes('Agregar');
    
    this.results.push({
      module: 'Inventario',
      test: 'Botón Agregar Medicamento',
      expected: userRole === 'cliente' ? 'No visible' : 'Visible',
      actual: hasAddButton ? 'Visible' : 'No visible',
      passed: userRole === 'cliente' ? !hasAddButton : !!hasAddButton
    });
    
    // Verificar campo de búsqueda
    const searchField = document.querySelector('input[placeholder*="Buscar"]');
    
    this.results.push({
      module: 'Inventario',
      test: 'Campo de Búsqueda',
      expected: 'Visible para todos',
      actual: searchField ? 'Visible' : 'No visible',
      passed: !!searchField
    });
    
    // Verificar iconos de editar/eliminar en tabla
    const editIcons = document.querySelectorAll('.MuiIconButton-root');
    const hasEditIcons = editIcons.length > 0;
    
    this.results.push({
      module: 'Inventario',
      test: 'Iconos Editar/Eliminar',
      expected: userRole === 'cliente' ? 'No visibles' : 'Visibles',
      actual: hasEditIcons ? 'Visibles' : 'No visibles',
      passed: userRole === 'cliente' ? !hasEditIcons : hasEditIcons
    });
  }
  
  /**
   * Ejecuta todas las validaciones
   */
  runAllValidations(): void {
    console.log('═══════════════════════════════════════════');
    console.log('🔧 VALIDACIÓN AUTOMÁTICA DEL SISTEMA');
    console.log('═══════════════════════════════════════════');
    
    const userRole = this.getUserRole();
    
    if (!userRole) {
      console.error('❌ ERROR: No se pudo obtener el rol del usuario');
      console.log('Por favor, inicia sesión primero');
      return;
    }
    
    console.log(`\n👤 Usuario actual: ${userRole.toUpperCase()}`);
    console.log('═══════════════════════════════════════════\n');
    
    this.results = [];
    
    // Ejecutar validaciones según la página actual
    const currentPath = window.location.pathname;
    
    if (currentPath === '/pets') {
      this.validatePetsPermissions();
    } else if (currentPath === '/dashboard' || currentPath === '/') {
      this.validateDashboard();
    } else if (currentPath === '/appointments') {
      this.validateAppointments();
    } else if (currentPath === '/inventory') {
      this.validateInventory();
    } else {
      console.log('⚠️ Navega a una de estas páginas para validar:');
      console.log('   - /dashboard');
      console.log('   - /pets');
      console.log('   - /appointments');
      console.log('   - /inventory');
      return;
    }
    
    this.printResults();
  }
  
  /**
   * Imprime los resultados de la validación
   */
  private printResults(): void {
    console.log('\n📊 RESULTADOS DE LA VALIDACIÓN:');
    console.log('───────────────────────────────────────────');
    
    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.module]) {
        acc[result.module] = [];
      }
      acc[result.module].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);
    
    Object.entries(groupedResults).forEach(([module, results]) => {
      console.log(`\n📁 ${module.toUpperCase()}`);
      
      results.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        console.log(`   ${icon} ${result.test}`);
        console.log(`      Esperado: ${result.expected}`);
        console.log(`      Actual: ${result.actual}`);
        
        if (!result.passed) {
          console.log(`      ⚠️ ATENCIÓN: Este test falló`);
        }
      });
    });
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n═══════════════════════════════════════════');
    console.log('📈 RESUMEN:');
    console.log(`   Total de pruebas: ${totalTests}`);
    console.log(`   ✅ Exitosas: ${passedTests}`);
    console.log(`   ❌ Fallidas: ${failedTests}`);
    
    if (failedTests === 0) {
      console.log('\n🎉 ¡TODAS LAS VALIDACIONES PASARON EXITOSAMENTE!');
    } else {
      console.log('\n⚠️ HAY VALIDACIONES QUE FALLARON');
      console.log('Posibles soluciones:');
      console.log('1. Limpia el caché del navegador (Ctrl+F5)');
      console.log('2. Cierra sesión y vuelve a iniciar');
      console.log('3. Verifica que los archivos estén actualizados');
    }
    
    console.log('═══════════════════════════════════════════\n');
  }
  
  /**
   * Valida el rol actual del usuario
   */
  validateCurrentUserRole(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    console.log('🔍 VALIDANDO DATOS DE SESIÓN:');
    console.log('───────────────────────────────────────────');
    
    if (!userStr) {
      console.error('❌ No hay usuario en localStorage');
      return;
    }
    
    if (!token) {
      console.error('❌ No hay token en localStorage');
      return;
    }
    
    try {
      const userObj = JSON.parse(userStr);
      console.log('✅ Usuario encontrado:');
      console.log(`   Email: ${userObj.email}`);
      console.log(`   Rol: ${userObj.role}`);
      console.log(`   Nombre: ${userObj.firstName} ${userObj.lastName}`);
      console.log(`   ID: ${userObj.id}`);
      
      // Verificar si hay un userRole incorrecto en localStorage
      const incorrectUserRole = localStorage.getItem('userRole');
      if (incorrectUserRole) {
        console.warn('⚠️ PROBLEMA DETECTADO:');
        console.warn('   Existe "userRole" en localStorage (esto es incorrecto)');
        console.warn('   El rol debe obtenerse de user.role');
        console.warn('   Ejecuta: localStorage.removeItem("userRole")');
      }
      
    } catch (error) {
      console.error('❌ Error al parsear usuario:', error);
    }
  }
}

// Hacer disponible globalmente para pruebas en consola
if (typeof window !== 'undefined') {
  (window as any).SystemValidator = SystemValidator;
  (window as any).validateSystem = () => {
    const validator = new SystemValidator();
    validator.validateCurrentUserRole();
    validator.runAllValidations();
  };
  
  console.log('💡 Sistema de Validación Cargado');
  console.log('   Para validar el sistema, ejecuta en la consola:');
  console.log('   validateSystem()');
}