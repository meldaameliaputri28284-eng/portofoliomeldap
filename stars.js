/**
 * Dynamic Ambient Shooting Stars & Meteors
 * - All stars fall in 1 uniform direction (40° diagonal downward-right)
 * - Varied spawn locations across the entire sky (no repeating spot)
 * - Features double meteor shower events ("meteor jatuh 2 kali") with luminous trails
 */
(function () {
  if (window.__shootingStarsActive) return;
  window.__shootingStarsActive = true;

  function initShootingStars() {
    let canvas = document.getElementById('shooting-stars-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'shooting-stars-canvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const stars = [];

    // Strictly 1 direction: 40 degrees diagonal downward-right
    const ANGLE_RAD = (40 * Math.PI) / 180;
    const DIR_X = Math.cos(ANGLE_RAD); // ~0.766
    const DIR_Y = Math.sin(ANGLE_RAD); // ~0.643

    // Spawn shooting star or dramatic meteor
    function spawnStar(isMeteor = false) {
      let startX, startY;
      if (Math.random() > 0.3) {
        startX = Math.random() * (width + 100) - 100;
        startY = -30;
      } else {
        startX = -30;
        startY = Math.random() * (height * 0.55);
      }

      if (isMeteor) {
        // Dramatic bright meteor with long glowing trail
        const speed = Math.random() * 4 + 13.5; // 13.5 - 17.5 px/frame
        const length = Math.random() * 80 + 160; // 160px - 240px
        const maxLife = Math.random() * 25 + 50;
        return {
          isMeteor: true,
          x: startX,
          y: startY,
          vx: DIR_X * speed,
          vy: DIR_Y * speed,
          length,
          life: 0,
          maxLife,
          opacity: 0,
          colorHue: '105, 225, 255',
          size: Math.random() * 0.6 + 2.5, // 2.5px - 3.1px
        };
      }

      // Small ambient shooting star
      const speed = Math.random() * 4 + 7.5; // 7.5 - 11.5 px/frame
      const length = Math.random() * 35 + 45; // 45px - 80px
      const maxLife = Math.random() * 25 + 35;
      const palette = ['105, 225, 255', '131, 197, 255', '167, 167, 255', '255, 255, 255'];
      const colorHue = palette[Math.floor(Math.random() * palette.length)];

      return {
        isMeteor: false,
        x: startX,
        y: startY,
        vx: DIR_X * speed,
        vy: DIR_Y * speed,
        length,
        life: 0,
        maxLife,
        opacity: 0,
        colorHue,
        size: Math.random() * 0.5 + 1.2, // 1.2px - 1.7px
      };
    }

    // Trigger double meteor shower ("meteor jatuh 2 kali")
    function triggerDoubleMeteor() {
      // First meteor
      stars.push(spawnStar(true));

      // Second meteor follows right after (380ms - 580ms) in another position
      setTimeout(() => {
        stars.push(spawnStar(true));
      }, Math.random() * 200 + 380);
    }

    let nextStarTime = 0;
    let nextMeteorTime = 1000; // First double meteor happens at 1.0s

    function animate(time) {
      ctx.clearRect(0, 0, width, height);

      // Check double meteor event ("meteor jatuh 2 kali")
      if (time >= nextMeteorTime) {
        triggerDoubleMeteor();
        // Repeats periodically every 7.5 - 11.5s
        nextMeteorTime = time + Math.random() * 4000 + 7500;
      }

      // Check regular small shooting star
      if (time >= nextStarTime) {
        stars.push(spawnStar(false));
        // Next small star every 1.8s - 3.2s
        nextStarTime = time + Math.random() * 1400 + 1800;
      }

      // Update and render stars
      for (let i = stars.length - 1; i >= 0; i--) {
        const s = stars[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;

        const progress = s.life / s.maxLife;
        if (progress < 0.15) {
          s.opacity = progress / 0.15;
        } else {
          s.opacity = Math.max(0, 1 - (progress - 0.15) / 0.85);
        }

        const tailX = s.x - DIR_X * s.length;
        const tailY = s.y - DIR_Y * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        if (s.isMeteor) {
          grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
          grad.addColorStop(0.15, `rgba(165, 245, 255, ${s.opacity * 0.95})`);
          grad.addColorStop(0.45, `rgba(105, 225, 255, ${s.opacity * 0.6})`);
          grad.addColorStop(1, `rgba(105, 225, 255, 0)`);
        } else {
          grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity * 0.95})`);
          grad.addColorStop(0.3, `rgba(${s.colorHue}, ${s.opacity * 0.7})`);
          grad.addColorStop(1, `rgba(${s.colorHue}, 0)`);
        }

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.shadowColor = s.isMeteor ? 'rgba(105, 225, 255, 0.95)' : `rgba(${s.colorHue}, ${s.opacity * 0.8})`;
        ctx.shadowBlur = s.isMeteor ? 14 : 6;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Glowing core head
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.isMeteor ? s.size * 0.85 : s.size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        if (s.life >= s.maxLife || s.x > width + 250 || s.y > height + 250) {
          stars.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShootingStars);
  } else {
    initShootingStars();
  }
})();
