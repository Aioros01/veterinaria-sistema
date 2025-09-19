export interface ConsentTemplate {
  type: string;
  title: string;
  description: string;
  risks: string[];
  alternatives: string[];
  postProcedureCare?: string[];
}

export class ConsentTemplateService {
  private static templates: Map<string, ConsentTemplate> = new Map([
    ['surgery', {
      type: 'surgery',
      title: 'Consentimiento para Procedimiento Quirúrgico',
      description: `Por medio del presente documento, yo [NOMBRE_PROPIETARIO], propietario/responsable de la mascota [NOMBRE_MASCOTA], 
      autorizo al equipo médico veterinario de [NOMBRE_CLINICA] a realizar el procedimiento quirúrgico de [PROCEDIMIENTO] 
      en mi mascota, habiendo sido informado de los riesgos y beneficios del mismo.`,
      risks: [
        'Riesgos anestésicos generales (reacciones alérgicas, problemas respiratorios)',
        'Hemorragia durante o después del procedimiento',
        'Infección postoperatoria',
        'Dehiscencia de suturas',
        'Complicaciones relacionadas con el procedimiento específico',
        'En casos excepcionales, muerte del paciente'
      ],
      alternatives: [
        'Tratamiento médico conservador (cuando aplique)',
        'No realizar el procedimiento (con los riesgos que esto conlleva)',
        'Referencia a un especialista'
      ],
      postProcedureCare: [
        'Reposo según indicaciones médicas',
        'Administración de medicamentos prescritos',
        'Uso de collar isabelino si es necesario',
        'Controles postoperatorios programados',
        'Vigilancia de signos de alerta'
      ]
    }],
    
    ['anesthesia', {
      type: 'anesthesia',
      title: 'Consentimiento para Anestesia',
      description: `Yo, [NOMBRE_PROPIETARIO], autorizo la aplicación de anestesia general/sedación a mi mascota [NOMBRE_MASCOTA] 
      para la realización del procedimiento de [PROCEDIMIENTO]. Comprendo que todo procedimiento anestésico conlleva riesgos 
      inherentes que han sido explicados por el veterinario tratante.`,
      risks: [
        'Reacciones alérgicas a los fármacos anestésicos',
        'Depresión respiratoria',
        'Alteraciones cardiovasculares (arritmias, hipotensión)',
        'Hipotermia',
        'Vómito y aspiración',
        'Retraso en la recuperación anestésica',
        'En casos raros, paro cardiorrespiratorio'
      ],
      alternatives: [
        'Anestesia local (cuando el procedimiento lo permita)',
        'Sedación ligera',
        'Posponer el procedimiento',
        'No realizar el procedimiento'
      ],
      postProcedureCare: [
        'Monitoreo durante la recuperación anestésica',
        'Ayuno post-anestésico según indicaciones',
        'Observación en casa las primeras 24 horas',
        'Ambiente tranquilo y temperatura adecuada'
      ]
    }],
    
    ['euthanasia', {
      type: 'euthanasia',
      title: 'Consentimiento para Eutanasia',
      description: `Yo, [NOMBRE_PROPIETARIO], propietario de la mascota [NOMBRE_MASCOTA], habiendo sido informado sobre 
      el estado de salud actual de mi mascota y considerando su calidad de vida, autorizo al Dr./Dra. [NOMBRE_VETERINARIO] 
      a realizar el procedimiento de eutanasia humanitaria. Comprendo que este procedimiento es irreversible y resultará 
      en la muerte de mi mascota de manera indolora y digna.`,
      risks: [],
      alternatives: [
        'Cuidados paliativos',
        'Tratamiento del dolor',
        'Hospitalización para cuidados intensivos',
        'Segunda opinión médica'
      ],
      postProcedureCare: [
        'Opciones para el manejo del cuerpo (cremación individual/colectiva, entierro)',
        'Apoyo emocional disponible',
        'Certificado de defunción si se requiere'
      ]
    }],
    
    ['treatment', {
      type: 'treatment',
      title: 'Consentimiento para Tratamiento Médico',
      description: `Yo, [NOMBRE_PROPIETARIO], autorizo el tratamiento médico de mi mascota [NOMBRE_MASCOTA] según el plan 
      terapéutico explicado por el veterinario tratante, que incluye [DESCRIPCION_TRATAMIENTO]. He sido informado sobre 
      los beneficios esperados y posibles efectos adversos del tratamiento.`,
      risks: [
        'Reacciones adversas a medicamentos',
        'Respuesta parcial o nula al tratamiento',
        'Necesidad de ajustar dosis o cambiar medicamentos',
        'Efectos secundarios específicos del tratamiento',
        'Interacciones medicamentosas'
      ],
      alternatives: [
        'Tratamientos alternativos disponibles',
        'Monitoreo sin tratamiento',
        'Referencia a especialista',
        'Medicina complementaria'
      ],
      postProcedureCare: [
        'Administración correcta de medicamentos',
        'Controles periódicos programados',
        'Monitoreo de efectos adversos',
        'Ajustes de dosis según respuesta'
      ]
    }]
  ]);

  static getTemplate(type: string): ConsentTemplate | undefined {
    return this.templates.get(type);
  }

  static getAllTemplates(): ConsentTemplate[] {
    return Array.from(this.templates.values());
  }

  static generateConsentText(
    type: string, 
    data: {
      ownerName: string;
      petName: string;
      clinicName: string;
      veterinarianName: string;
      procedureName?: string;
      treatmentDescription?: string;
    }
  ): string {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`Template not found for type: ${type}`);
    }

    let text = template.description
      .replace('[NOMBRE_PROPIETARIO]', data.ownerName)
      .replace('[NOMBRE_MASCOTA]', data.petName)
      .replace('[NOMBRE_CLINICA]', data.clinicName || 'nuestra clínica')
      .replace('[NOMBRE_VETERINARIO]', data.veterinarianName)
      .replace('[PROCEDIMIENTO]', data.procedureName || '')
      .replace('[DESCRIPCION_TRATAMIENTO]', data.treatmentDescription || '');

    // Agregar sección de riesgos
    if (template.risks.length > 0) {
      text += '\n\nRIESGOS ASOCIADOS:\n';
      template.risks.forEach(risk => {
        text += `• ${risk}\n`;
      });
    }

    // Agregar sección de alternativas
    if (template.alternatives.length > 0) {
      text += '\n\nALTERNATIVAS DISPONIBLES:\n';
      template.alternatives.forEach(alt => {
        text += `• ${alt}\n`;
      });
    }

    // Agregar cuidados post-procedimiento si aplica
    if (template.postProcedureCare && template.postProcedureCare.length > 0) {
      text += '\n\nCUIDADOS POST-PROCEDIMIENTO:\n';
      template.postProcedureCare.forEach(care => {
        text += `• ${care}\n`;
      });
    }

    // Agregar sección de firma
    text += `\n\nDeclaro que he leído y comprendido la información proporcionada, he tenido la oportunidad de hacer preguntas 
    y estas han sido respondidas satisfactoriamente. Doy mi consentimiento informado para proceder con el tratamiento descrito.

    Fecha: [FECHA]
    Firma del propietario/responsable: _________________________
    Nombre: ${data.ownerName}
    Documento de identidad: _________________________
    
    Veterinario tratante: ${data.veterinarianName}
    Matrícula profesional: _________________________`;

    return text;
  }

  static generatePDF(consentText: string): Buffer {
    // Esta función se implementaría con una librería como PDFKit o Puppeteer
    // Por ahora retornamos un placeholder
    return Buffer.from(consentText);
  }
}