// ============================================================================
// Amore Anonymous College Confession Platform - Instagram Image Service
// ============================================================================

export interface ConfessionForImage {
  sender_name: string | null;
  crush_name: string;
  department: string;
  academic_year: string;
  confession_message: string;
}

/**
 * Generate a self-contained HTML string for a 1080×1920 Instagram story card.
 * This HTML is designed to be rendered with html2canvas for image export.
 */
export function generateConfessionImageHTML(confession: ConfessionForImage): string {
  const senderDisplay = confession.sender_name || 'Anonymous';

  // Escape HTML entities to prevent injection
  const escapeHtml = (str: string): string =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const crushName = escapeHtml(confession.crush_name);
  const department = escapeHtml(confession.department);
  const year = escapeHtml(confession.academic_year);
  const message = escapeHtml(confession.confession_message);
  const sender = escapeHtml(senderDisplay);

  // Dynamically adjust font size based on message length
  let messageFontSize = '32px';
  let messageLineHeight = '1.6';
  if (message.length > 500) {
    messageFontSize = '24px';
    messageLineHeight = '1.5';
  } else if (message.length > 300) {
    messageFontSize = '28px';
    messageLineHeight = '1.55';
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <div id="confession-card" style="
    width: 1080px;
    height: 1920px;
    background: linear-gradient(145deg, #1a0a2e 0%, #321442 25%, #4a1a5e 50%, #321442 75%, #151022 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 80px 60px;
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    position: relative;
    overflow: hidden;
    color: #ffffff;
  ">
    <!-- Background decorative hearts -->
    <div style="
      position: absolute;
      top: 120px;
      left: -30px;
      font-size: 200px;
      opacity: 0.06;
      transform: rotate(-15deg);
      pointer-events: none;
    ">💕</div>
    <div style="
      position: absolute;
      bottom: 200px;
      right: -20px;
      font-size: 180px;
      opacity: 0.06;
      transform: rotate(20deg);
      pointer-events: none;
    ">💗</div>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 300px;
      opacity: 0.03;
      pointer-events: none;
    ">❤️</div>

    <!-- Subtle glow overlay -->
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(ellipse at 30% 20%, rgba(247,182,210,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 80%, rgba(217,200,242,0.08) 0%, transparent 60%);
      pointer-events: none;
    "></div>

    <!-- Top: Branding -->
    <div style="
      text-align: center;
      position: relative;
      z-index: 1;
    ">
      <div style="
        font-size: 20px;
        letter-spacing: 8px;
        text-transform: uppercase;
        color: rgba(247, 182, 210, 0.6);
        margin-bottom: 12px;
      ">✦ Anonymous Confession ✦</div>
      <div style="
        font-size: 72px;
        font-weight: 700;
        background: linear-gradient(135deg, #F7B6D2 0%, #D9C8F2 50%, #F7B6D2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 4px;
      ">Amore</div>
      <div style="
        width: 200px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #F7B6D2, transparent);
        margin: 16px auto 0;
      "></div>
    </div>

    <!-- Middle: Confession content -->
    <div style="
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      max-width: 900px;
      position: relative;
      z-index: 1;
      padding: 40px 0;
    ">
      <!-- To crush -->
      <div style="
        font-size: 26px;
        color: rgba(247, 182, 210, 0.8);
        margin-bottom: 24px;
        letter-spacing: 3px;
        text-transform: uppercase;
      ">Dear</div>
      <div style="
        font-size: 48px;
        font-weight: 600;
        color: #F7B6D2;
        margin-bottom: 40px;
        text-align: center;
        text-shadow: 0 0 30px rgba(247, 182, 210, 0.3);
      ">${crushName}</div>

      <!-- Decorative quote marks -->
      <div style="
        font-size: 80px;
        color: rgba(217, 200, 242, 0.3);
        line-height: 1;
        margin-bottom: -20px;
        font-family: Georgia, serif;
      ">"</div>

      <!-- Confession message -->
      <div style="
        font-size: ${messageFontSize};
        line-height: ${messageLineHeight};
        text-align: center;
        color: rgba(255, 255, 255, 0.92);
        padding: 0 20px;
        max-height: 800px;
        overflow: hidden;
        font-weight: 300;
        letter-spacing: 0.5px;
      ">${message}</div>

      <div style="
        font-size: 80px;
        color: rgba(217, 200, 242, 0.3);
        line-height: 1;
        margin-top: -10px;
        font-family: Georgia, serif;
      ">"</div>
    </div>

    <!-- Bottom: Sender info + Department -->
    <div style="
      text-align: center;
      position: relative;
      z-index: 1;
    ">
      <!-- Sender -->
      <div style="
        font-size: 22px;
        color: rgba(217, 200, 242, 0.7);
        margin-bottom: 8px;
        letter-spacing: 2px;
      ">— ${sender} —</div>

      <!-- Department & Year -->
      <div style="
        font-size: 20px;
        color: rgba(247, 182, 210, 0.5);
        letter-spacing: 3px;
        text-transform: uppercase;
        margin-bottom: 24px;
      ">${department} • ${year} Year</div>

      <!-- Decorative bottom line -->
      <div style="
        width: 120px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #D9C8F2, transparent);
        margin: 0 auto 16px;
      "></div>

      <!-- Small hearts -->
      <div style="
        font-size: 24px;
        opacity: 0.5;
        letter-spacing: 12px;
      ">♡ ♡ ♡</div>
    </div>
  </div>
</body>
</html>`;
}
