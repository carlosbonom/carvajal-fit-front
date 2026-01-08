import { NewsletterDesign, EditorBlock } from '../types';

export const generateNewsletterHtml = (design: NewsletterDesign): string => {
  const blocks = design?.blocks || [];
  const globalStyles = design?.globalStyles;
  const bgColor = globalStyles?.backgroundColor || '#f4f4f4';
  const fontFamily = globalStyles?.fontFamily || "'Inter', 'Helvetica', 'Arial', sans-serif";

  const renderBlock = (block: EditorBlock): string => {
    switch (block.type) {
      case 'text':
        // Handle line breaks by converting \n to <br>
        const processedText = block.content.text ? block.content.text.replace(/\n/g, '<br/>') : '';
        return `
          <tr>
            <td style="
                padding: 32px; 
                color: ${block.content.textColor || '#334155'}; 
                background-color: ${block.content.backgroundColor || 'transparent'};
                line-height: 1.625; 
                font-size: ${block.content.fontSize || 15}px; 
                text-align: ${block.content.textAlign || 'left'};
                font-family: 'Inter', sans-serif;
            ">
              ${processedText}
            </td>
          </tr>
        `;
      case 'image':
        return `
          <tr>
            <td align="center" style="padding: 0; background-color: #f8fafc;">
              ${block.content.link ? `<a href="${block.content.link}" target="_blank">` : ''}
              <img src="${block.content.url}" alt="${block.content.alt || ''}" width="${block.content.width || '100%'}" style="width: ${block.content.width || 100}%; max-width: 100%; height: auto; display: block; margin: 0 auto;" />
              ${block.content.link ? '</a>' : ''}
            </td>
          </tr>
        `;
      case 'button':
        return `
          <tr>
            <td align="center" style="padding: 40px 32px;">
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" bgcolor="${block.content.backgroundColor}" style="border-radius: ${block.content.borderRadius || 8}px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
                    <a href="${block.content.url}" target="_blank" style="font-size: 15px; font-weight: 800; color: ${block.content.color || '#ffffff'}; text-decoration: none; padding: 14px 40px; display: inline-block; letter-spacing: 0.01em;">
                      ${block.content.text}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      case 'divider':
        return `
          <tr>
            <td style="padding: ${block.content.padding || 20}px 32px;">
              <hr style="border: 0; border-top: 1px solid #e2e8f0;" />
            </td>
          </tr>
        `;
      case 'spacer':
        return `
          <tr>
            <td height="${block.content.height || 50}" style="font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        `;
      case 'html':
        return `
          <tr>
            <td width="100%">
              ${block.content.html}
            </td>
          </tr>
        `;
      case 'social':
        const networks = block.content.networks || [];
        // Map networks to icon URLs (using a reliable CDN like Shields.io or similar for simplicity/reliability, or just styled blocks)
        // Using shields.io badges is reliable and looks decent for a start, or a public icon set.
        // Let's use simple text links with colors for maximum compatibility if no images.
        // Actually, let's use a nice table layout.
        const renderSocialIcon = (net: any) => {
          const colors: any = {
            facebook: '#1877F2',
            instagram: '#E4405F',
            twitter: '#1DA1F2',
            linkedin: '#0A66C2',
            website: '#333333'
          };
          const color = colors[net.network] || '#333333';
          return `
                <a href="${net.url}" target="_blank" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                    <span style="display: inline-block; padding: 8px 16px; background-color: ${color}; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                        ${net.network}
                    </span>
                </a>
            `;
        };

        return `
          <tr>
            <td align="center" style="padding: 20px 0;">
                ${networks.map(renderSocialIcon).join('')}
            </td>
          </tr>
        `;
      default:
        return '';
    }
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Newsletter</title>
    <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { background-color: ${bgColor}; font-family: ${fontFamily}; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor};">
    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <!-- Header/Logo Area -->
            <!-- Aquí podrías añadir un logo por defecto -->
            
            <!-- Content Blocks -->
            ${blocks.map(renderBlock).join('')}
            
            <!-- Footer Area -->
            <tr>
              <td style="padding: 40px; color: #999999; font-size: 12px; text-align: center;">
                <p>&copy; ${new Date().getFullYear()} Carvajal Fit. Todos los derechos reservados.</p>
                <p>Estás recibiendo este correo porque eres miembro de nuestro club.</p>
              </td>
            </tr>
        </table>
    </center>
</body>
</html>
  `.trim();
};
