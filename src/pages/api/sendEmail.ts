import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

// Marcar esta ruta como server-rendered
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Verificar que el content-type sea JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Content-Type debe ser application/json' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Obtener datos del formulario
    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      console.error('❌ Error parsing JSON:', jsonError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error al procesar los datos del formulario' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('📨 Datos recibidos:', { ...data, message: data.message?.substring(0, 50) + '...' });

    const { name, email, company, phone, product, message } = data;

    // Validaciones básicas
    if (!name || !email || !phone || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Todos los campos requeridos deben estar completos (Nombre, Email, Teléfono, Mensaje)' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'El formato del email no es válido' 
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const nombreRegex = /^[a-zA-ZÀ-ÿ\s]{2,50}$/;
    if (!nombreRegex.test(name)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'El nombre no es válido'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const messageRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    if (messageRegex.test(message)) {
      return new Response(
        JSON.stringify({
            success: false,
            message: 'El mensaje contiene contenido no permitido.'
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
        );
    }

    // Verificar variables de entorno
    if (!import.meta.env.EMAIL_USER || !import.meta.env.EMAIL_PASS) {
      console.error('❌ Variables de entorno faltantes:', {
        EMAIL_USER: !!import.meta.env.EMAIL_USER,
        EMAIL_PASS: !!import.meta.env.EMAIL_PASS
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Configuración de email no disponible' 
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Configurar transporter de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Puedes cambiar por 'outlook' u otro servicio
      auth: {
        user: import.meta.env.EMAIL_USER, // Tu email
        pass: import.meta.env.EMAIL_PASS  // Tu app password
      }
    });

    // Formatear fecha
    const fechaRecepcion = new Date().toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Plantilla HTML para el email
    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo mensaje de contacto</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6; 
          color: #333;
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #1F3C68 0%, #9C2D32 100%);
          padding: 30px;
          text-align: center;
        }
        .header h1 { 
          color: white; 
          font-size: 26px;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .header p { 
          color: rgba(255, 255, 255, 0.95);
          font-size: 16px;
        }
        .content { 
          padding: 30px;
        }
        .section { 
          margin-bottom: 25px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border-left: 4px solid #1F3C68;
        }
        .section h3 { 
          color: #1e293b;
          margin-bottom: 12px;
          font-size: 18px;
        }
        .info-grid { 
          display: grid; 
          gap: 12px;
        }
        .info-row { 
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .label { 
          font-weight: 600;
          color: #475569;
          min-width: 120px;
          flex-shrink: 0;
        }
        .value { 
          color: #1e293b;
          flex: 1;
        }
        .message-content { 
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          white-space: pre-wrap;
          font-size: 15px;
          line-height: 1.7;
        }
        .footer { 
          padding: 20px 30px;
          background: #f1f5f9;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .highlight { 
          color: #3b82f6;
          font-weight: 600;
        }
        .urgent { 
          background: #fef3cd;
          border-left-color: #f59e0b;
        }
        .urgent .label { 
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📩 Nueva Solicitud de Cotización</h1>
          <p>Has recibido una solicitud desde el sitio web de LOREL</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h3>👤 Información del Cliente</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="label">Nombre:</span>
                <span class="value highlight">${name}</span>
              </div>
              <div class="info-row">
                <span class="label">Email:</span>
                <span class="value"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></span>
              </div>
              ${company ? `
              <div class="info-row">
                <span class="label">Empresa:</span>
                <span class="value">${company}</span>
              </div>
              ` : ''}
              ${phone ? `
              <div class="info-row">
                <span class="label">Teléfono:</span>
                <span class="value"><a href="tel:${phone}" style="color: #3b82f6;">${phone}</a></span>
              </div>
              ` : ''}
            </div>
          </div>

          ${product ? `
          <div class="section">
            <h3>📦 Producto de Interés</h3>
            <div class="info-grid">
              <div class="info-row">
                <span class="value highlight">${product}</span>
              </div>
            </div>
          </div>
          ` : ''}

          <div class="section">
            <h3>💬 Mensaje del Cliente</h3>
            <div class="message-content">${message}</div>
          </div>
        </div>

        <div class="footer">
          <p>Mensaje recibido el ${new Date().toLocaleString('es-ES', {
            timeZone: 'America/Mexico_City',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p style="margin-top: 8px; color: #94a3b8;">
            Portafolio • <a href="mailto:${email}" style="color: #3b82f6;">Responder directamente</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Plantilla HTML para email de confirmación al cliente
    const confirmationTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de mensaje recibido</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6; 
          color: #333;
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #1F3C68 0%, #9C2D32 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 { 
          color: white; 
          font-size: 28px;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .header p { 
          color: rgba(255, 255, 255, 0.95);
          font-size: 18px;
        }
        .content { 
          padding: 40px 30px;
        }
        .greeting { 
          font-size: 18px;
          color: #1e293b;
          margin-bottom: 25px;
        }
        .highlight-name {
          color: #1F3C68;
          font-weight: 600;
        }
        .confirmation-box { 
          background: linear-gradient(135deg, #f0f4f8 0%, #e8eef4 100%);
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #1F3C68;
          margin: 25px 0;
        }
        .confirmation-box h3 { 
          color: #1F3C68;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .project-summary { 
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .project-summary h4 { 
          color: #475569;
          margin-bottom: 12px;
          font-size: 16px;
        }
        .summary-item { 
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .summary-item:last-child {
          border-bottom: none;
        }
        .summary-label { 
          color: #64748b;
          font-weight: 500;
        }
        .summary-value { 
          color: #1e293b;
          font-weight: 600;
        }
        .next-steps { 
          background: #fefce8;
          border-left: 4px solid #eab308;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .next-steps h4 { 
          color: #a16207;
          margin-bottom: 12px;
        }
        .next-steps ul { 
          color: #713f12;
          margin-left: 20px;
        }
        .next-steps li { 
          margin-bottom: 8px;
        }
        .footer { 
          padding: 30px;
          background: #f1f5f9;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        .contact-info { 
          margin: 20px 0;
          font-size: 14px;
          color: #64748b;
        }
        .contact-info a { 
          color: #3b82f6;
          text-decoration: none;
        }
        .social-links { 
          margin-top: 20px;
        }
        .social-links a { 
          display: inline-block;
          margin: 0 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
        }
        .social-links a:hover { 
          color: #3b82f6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ¡Solicitud Recibida!</h1>
          <p>Gracias por contactar a LOREL</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hola <span class="highlight-name">${name}</span>,
          </div>
          
          <p style="margin-bottom: 25px; color: #475569; font-size: 16px; line-height: 1.7;">
            ¡Gracias por contactarnos! Hemos recibido tu solicitud de cotización${product ? ` sobre <strong>${product}</strong>` : ''} 
            y en breve nos pondremos en contacto contigo.
          </p>

          <div class="confirmation-box">
            <h3>📨 Confirmación de recepción</h3>
            <p style="color: #1e40af; margin-bottom: 12px;">
              Tu mensaje ha sido recibido exitosamente y nuestro equipo lo está revisando.
            </p>
            <p style="color: #64748b; font-size: 14px;">
              Fecha de recepción: ${fechaRecepcion}
            </p>
          </div>

          <div class="project-summary">
            <h4>📋 Resumen de tu solicitud:</h4>
            ${product ? `
            <div class="summary-item">
              <span class="summary-label">Producto de interés:</span>
              <span class="summary-value">${product}</span>
            </div>
            ` : ''}
            ${company ? `
            <div class="summary-item">
              <span class="summary-label">Empresa:</span>
              <span class="summary-value">${company}</span>
            </div>
            ` : ''}
          </div>

          <div class="next-steps">
            <h4>🚀 Próximos pasos:</h4>
            <ul>
              <li><strong>Revisión:</strong> Nuestro equipo analizará tu solicitud en detalle</li>
              <li><strong>Respuesta:</strong> Te contactaremos en las próximas 24-48 horas</li>
              <li><strong>Cotización:</strong> Te enviaremos una cotización personalizada</li>
              <li><strong>Atención:</strong> Estamos listos para resolver tus dudas</li>
            </ul>
          </div>

          <p style="color: #475569; font-size: 16px; line-height: 1.7; margin-top: 25px;">
            En LOREL nos especializamos en ofrecer productos de imprenta de la más alta calidad,
            con atención personalizada y precios competitivos.
          </p>

          <p style="color: #475569; font-size: 16px; line-height: 1.7; margin-top: 20px;">
            Si tienes alguna pregunta urgente o quieres agregar más información, 
            no dudes en responder a este email o llamarnos directamente.
          </p>

          <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin-top: 30px;">
            ¡Esperamos trabajar contigo pronto! �
          </p>
          
          <p style="color: #64748b; font-size: 16px; margin-top: 10px;">
            Atentamente,<br>
            <strong style="color: #1F3C68;">Equipo LOREL</strong>
          </p>
        </div>

        <div class="footer">
          <div class="contact-info">
            <p><strong>LOREL | Impresos de Calidad</strong></p>
            <p>
              📧 <a href="mailto:${import.meta.env.EMAIL_USER}">${import.meta.env.EMAIL_USER}</a>
            </p>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
            Este es un email automático de confirmación. Si no solicitaste esta información, 
            puedes ignorar este mensaje.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Configurar opciones del email para LOREL
    const developerMailOptions = {
      from: `"LOREL Website" <${import.meta.env.EMAIL_USER}>`,
      to: import.meta.env.EMAIL_USER,
      replyTo: email,
      subject: `� Nueva Solicitud de Cotización - ${name}${product ? ` - ${product}` : ''}`,
      html: htmlTemplate,
      // También enviar versión en texto plano
      text: `
Nuevo mensaje de contacto:

Información del Cliente:
- Nombre: ${name}
- Email: ${email}
- Teléfono: ${phone}
${company ? `- Empresa: ${company}` : ''}
${product ? `- Producto: ${product}` : ''}

Mensaje:
${message}

---
Recibido el ${fechaRecepcion}
      `
    };

    // Configurar opciones del email de confirmación para el cliente
    const clientMailOptions = {
      from: `"LOREL - Impresos de Calidad" <${import.meta.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Confirmación: Hemos recibido tu solicitud de cotización`,
      html: confirmationTemplate,
      // También enviar versión en texto plano
      text: `
Hola ${name},

¡Gracias por contactarnos! Hemos recibido tu solicitud de cotización${product ? ` sobre ${product}` : ''} y en breve nos pondremos en contacto contigo.

Resumen de tu solicitud:
${product ? `- Producto: ${product}` : ''}
${company ? `- Empresa: ${company}` : ''}
${company ? `- Empresa: ${company}` : ''}

Próximos pasos:
1. Revisaré tu proyecto en detalle
2. Te contactaré en las próximas 24 horas
3. Te enviaré una propuesta personalizada
4. Programaremos una videollamada si es necesario

Si tienes alguna pregunta urgente, no dudes en responder a este email.

¡Espero trabajar contigo pronto! 🚀

Saludos,
Josué - Desarrollador Web

---
Mensaje recibido el ${new Date().toLocaleString('es-ES')}
      `
    };

    // Enviar ambos emails
    try {
      // Enviar email al desarrollador (tú)
      const developerInfo = await transporter.sendMail(developerMailOptions);
      console.log('✅ Email enviado al desarrollador:', developerInfo.messageId);

      // Enviar email de confirmación al cliente
      const clientInfo = await transporter.sendMail(clientMailOptions);
      console.log('✅ Email de confirmación enviado al cliente:', clientInfo.messageId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Mensaje enviado correctamente. Se ha enviado una confirmación a tu email.',
          developerMessageId: developerInfo.messageId,
          clientMessageId: clientInfo.messageId
        }),
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

    } catch (emailError) {
      console.error('❌ Error específico al enviar emails:', emailError);
      
      // Si falla el envío, intentar al menos notificar por consola
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Error al enviar el email. Verifica la configuración de email.' 
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error interno del servidor. Intenta nuevamente.' 
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};