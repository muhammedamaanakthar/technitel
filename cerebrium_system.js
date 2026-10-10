/* Cerebrium-style Interactive Animation Engine for Technitel */
(function() {
  'use strict';

  // ==========================================
  // 1. THREE.JS 3D TELECOM NETWORK SCENE
  // ==========================================
  function initThreeTelecomScene() {
    const wrap = document.getElementById('heroCanvasWrap');
    if (!wrap) return;

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded, starting 2D fallback');
      initCanvas2DFallback(wrap);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b0c, 0.0014);

    let width = wrap.clientWidth || window.innerWidth;
    let height = wrap.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 2200);
    camera.position.set(0, 0, 260);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: true,
        alpha: true
      });
    } catch (e) {
      console.warn('WebGL init failed, using 2D fallback', e);
      initCanvas2DFallback(wrap);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Node particle texture
    function createGlowTexture() {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255, 255, 255, 1)');
      g.addColorStop(0.2, 'rgba(255, 120, 125, 0.9)');
      g.addColorStop(0.5, 'rgba(225, 38, 45, 0.45)');
      g.addColorStop(1, 'rgba(225, 38, 45, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    const glowTex = createGlowTexture();

    // 140 Telecom Transmission Nodes
    const nodeCount = 140;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeColors = new Float32Array(nodeCount * 3);
    const nodeData = [];

    const colWhite = new THREE.Color(0xffffff);
    const colRed = new THREE.Color(0xe1262d);
    const colRedSoft = new THREE.Color(0xff757a);

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 620;
      const y = (Math.random() - 0.5) * 380;
      const z = (Math.random() - 0.5) * 500 - 40;

      nodePositions[i * 3] = x;
      nodePositions[i * 3 + 1] = y;
      nodePositions[i * 3 + 2] = z;

      nodeData.push({
        baseX: x, baseY: y, baseZ: z,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        vz: (Math.random() - 0.5) * 0.15
      });

      const rVal = Math.random();
      const col = rVal > 0.65 ? colRed : (rVal > 0.35 ? colRedSoft : colWhite);
      nodeColors[i * 3] = col.r;
      nodeColors[i * 3 + 1] = col.g;
      nodeColors[i * 3 + 2] = col.b;
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    const nodeMat = new THREE.PointsMaterial({
      size: 14,
      vertexColors: true,
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    group.add(nodePoints);

    // Fiber Optic Interconnect Lines
    const maxLineSegs = 280;
    const linePositions = new Float32Array(maxLineSegs * 6);
    const lineColors = new Float32Array(maxLineSegs * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineSegments);

    // Traveling Data Packets
    const packetCount = 42;
    const packetPos = new Float32Array(packetCount * 3);
    const packetCol = new Float32Array(packetCount * 3);
    const packets = [];

    for (let i = 0; i < packetCount; i++) {
      packetCol[i * 3] = 1;
      packetCol[i * 3 + 1] = 0.35;
      packetCol[i * 3 + 2] = 0.4;
      packets.push({
        n1: Math.floor(Math.random() * nodeCount),
        n2: Math.floor(Math.random() * nodeCount),
        t: Math.random(),
        speed: 0.007 + Math.random() * 0.014
      });
    }

    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    packetGeo.setAttribute('color', new THREE.BufferAttribute(packetCol, 3));
    const packetMat = new THREE.PointsMaterial({
      size: 10,
      vertexColors: true,
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const packetPoints = new THREE.Points(packetGeo, packetMat);
    group.add(packetPoints);

    // Holographic Telecommunications Geodesic Core
    const globeGeo = new THREE.IcosahedronGeometry(72, 2);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0xe1262d,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeMesh.position.set(120, -15, -70);
    group.add(globeMesh);

    // Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(88, 0.7, 16, 75);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff4b51,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.position.copy(globeMesh.position);
    ring1.rotation.x = Math.PI * 0.32;
    ring1.rotation.y = Math.PI * 0.18;
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(104, 0.5, 16, 75);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.position.copy(globeMesh.position);
    ring2.rotation.x = -Math.PI * 0.24;
    ring2.rotation.y = Math.PI * 0.42;
    group.add(ring2);

    // Warp Streaks for Hyperspace Mode
    const warpCount = 220;
    const warpPositions = new Float32Array(warpCount * 6);
    const warpColors = new Float32Array(warpCount * 6);
    const warpStreaks = [];

    for (let i = 0; i < warpCount; i++) {
      const x = (Math.random() - 0.5) * 850;
      const y = (Math.random() - 0.5) * 520;
      const z = Math.random() * -850;
      const speed = 14 + Math.random() * 26;
      warpStreaks.push({ x, y, z, speed, len: 40 + Math.random() * 80 });

      const isRed = Math.random() > 0.45;
      for (let v = 0; v < 2; v++) {
        warpColors[i * 6 + v * 3] = isRed ? 1 : 1;
        warpColors[i * 6 + v * 3 + 1] = isRed ? 0.22 : 1;
        warpColors[i * 6 + v * 3 + 2] = isRed ? 0.28 : 1;
      }
    }

    const warpGeo = new THREE.BufferGeometry();
    warpGeo.setAttribute('position', new THREE.BufferAttribute(warpPositions, 3).setUsage(THREE.DynamicDrawUsage));
    warpGeo.setAttribute('color', new THREE.BufferAttribute(warpColors, 3));
    const warpMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const warpMesh = new THREE.LineSegments(warpGeo, warpMat);
    scene.add(warpMesh);

    // Interaction State
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;
    let warpFactor = 0;
    let isHolding = false;
    let isHeroVisible = true;

    window.__technitelHold = {
      start: () => { isHolding = true; },
      end: () => { isHolding = false; }
    };

    window.addEventListener('pointermove', e => {
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    // Handle Resize
    function onResize() {
      width = wrap.clientWidth || window.innerWidth;
      height = wrap.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', onResize);

    // Visibility Observer to pause when hidden
    const heroElem = document.getElementById('top');
    if ('IntersectionObserver' in window && heroElem) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          isHeroVisible = entry.isIntersecting && !heroElem.hidden;
        });
      }, { threshold: 0.05 });
      obs.observe(heroElem);
    }

    // Main Animation Loop
    let clock = 0;
    function animate() {
      requestAnimationFrame(animate);

      if (!isHeroVisible || (heroElem && heroElem.hidden)) return;

      clock += 0.016;

      // Tween Warp factor (0 -> 1 when holding, 1 -> 0 when released)
      if (isHolding) {
        warpFactor += (1 - warpFactor) * 0.06;
      } else {
        warpFactor += (0 - warpFactor) * 0.08;
      }

      // Smooth camera mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const baseCamZ = 260 - warpFactor * 140;
      camera.position.x = mouseX * 42;
      camera.position.y = mouseY * 28;
      camera.position.z = baseCamZ;
      camera.lookAt(0, 0, 0);

      // Rotate group & core globe
      const rotSpeed = 0.0015 + warpFactor * 0.01;
      group.rotation.y += rotSpeed;
      group.rotation.x = Math.sin(clock * 0.3) * 0.06;

      globeMesh.rotation.y += 0.005 + warpFactor * 0.02;
      globeMesh.rotation.x += 0.003;
      ring1.rotation.z += 0.008 + warpFactor * 0.025;
      ring2.rotation.z -= 0.006 + warpFactor * 0.02;

      // Update Node positions & connections
      const positions = nodeGeo.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        const d = nodeData[i];
        d.baseX += d.vx;
        d.baseY += d.vy;
        d.baseZ += d.vz;

        if (Math.abs(d.baseX) > 310) d.vx *= -1;
        if (Math.abs(d.baseY) > 190) d.vy *= -1;
        if (Math.abs(d.baseZ) > 260) d.vz *= -1;

        positions[i * 3] = d.baseX;
        positions[i * 3 + 1] = d.baseY;
        positions[i * 3 + 2] = d.baseZ;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Dynamic Fiber Optic Connections
      let lineIdx = 0;
      const lPos = lineGeo.attributes.position.array;
      const lCol = lineGeo.attributes.color.array;
      const maxDist = 92 + warpFactor * 25;

      for (let i = 0; i < nodeCount && lineIdx < maxLineSegs; i++) {
        for (let j = i + 1; j < nodeCount && lineIdx < maxLineSegs; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (0.45 + warpFactor * 0.4);

            lPos[lineIdx * 6] = positions[i * 3];
            lPos[lineIdx * 6 + 1] = positions[i * 3 + 1];
            lPos[lineIdx * 6 + 2] = positions[i * 3 + 2];
            lPos[lineIdx * 6 + 3] = positions[j * 3];
            lPos[lineIdx * 6 + 4] = positions[j * 3 + 1];
            lPos[lineIdx * 6 + 5] = positions[j * 3 + 2];

            const col = (i + j) % 3 === 0 ? colRed : colRedSoft;
            for (let v = 0; v < 2; v++) {
              lCol[lineIdx * 6 + v * 3] = col.r * alpha;
              lCol[lineIdx * 6 + v * 3 + 1] = col.g * alpha;
              lCol[lineIdx * 6 + v * 3 + 2] = col.b * alpha;
            }
            lineIdx++;
          }
        }
      }
      lineGeo.setDrawRange(0, lineIdx * 2);
      lineGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.color.needsUpdate = true;

      // Update Data Packets
      const pkPos = packetGeo.attributes.position.array;
      const pSpeedMult = 1 + warpFactor * 3.5;
      for (let i = 0; i < packetCount; i++) {
        const p = packets[i];
        p.t += p.speed * pSpeedMult;
        if (p.t >= 1) {
          p.t = 0;
          p.n1 = Math.floor(Math.random() * nodeCount);
          p.n2 = Math.floor(Math.random() * nodeCount);
        }
        const x1 = positions[p.n1 * 3], y1 = positions[p.n1 * 3 + 1], z1 = positions[p.n1 * 3 + 2];
        const x2 = positions[p.n2 * 3], y2 = positions[p.n2 * 3 + 1], z2 = positions[p.n2 * 3 + 2];

        pkPos[i * 3] = x1 + (x2 - x1) * p.t;
        pkPos[i * 3 + 1] = y1 + (y2 - y1) * p.t;
        pkPos[i * 3 + 2] = z1 + (z2 - z1) * p.t;
      }
      packetGeo.attributes.position.needsUpdate = true;

      // Update Warp Streaks
      warpMat.opacity = warpFactor * 0.95;
      if (warpFactor > 0.02) {
        const wPos = warpGeo.attributes.position.array;
        for (let i = 0; i < warpCount; i++) {
          const s = warpStreaks[i];
          s.z += s.speed * (0.8 + warpFactor * 2.5);
          if (s.z > 350) {
            s.z = -750;
            s.x = (Math.random() - 0.5) * 850;
            s.y = (Math.random() - 0.5) * 520;
          }
          wPos[i * 6] = s.x;
          wPos[i * 6 + 1] = s.y;
          wPos[i * 6 + 2] = s.z;
          wPos[i * 6 + 3] = s.x;
          wPos[i * 6 + 4] = s.y;
          wPos[i * 6 + 5] = s.z + s.len * (1 + warpFactor * 1.5);
        }
        warpGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  // Fallback 2D Canvas if WebGL is unavailable
  function initCanvas2DFallback(wrap) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-canvas';
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let width = canvas.width = wrap.clientWidth || window.innerWidth;
    let height = canvas.height = wrap.clientHeight || window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = wrap.clientWidth || window.innerWidth;
      height = canvas.height = wrap.clientHeight || window.innerHeight;
    });

    const dots = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 1
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = '#E1262D';
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = `rgba(225, 38, 45, ${0.4 * (1 - dist / 90)})`;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  // ==========================================
  // 2. CEREBRIUM-STYLE FOLLOWER CURSOR & HOLD
  // ==========================================
  function initHeroHoldController() {
    const cursor = document.getElementById('heroCursor');
    const progressRing = document.getElementById('heroCursorProgress');
    const hero = document.getElementById('top');
    const overlay = document.getElementById('heroHoldOverlay');
    const mobileTrigger = document.getElementById('mobileHoldTrigger');

    if (!cursor || !hero || !progressRing) return;

    const ringCircumference = 2 * Math.PI * 71; // r=71 => ~446.1
    progressRing.style.strokeDasharray = ringCircumference;
    progressRing.style.strokeDashoffset = ringCircumference;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let cursorX = pointerX;
    let cursorY = pointerY;
    let isHolding = false;
    let isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let cursorVisible = false;
    let cursorShouldHide = false;
    let holdDuration = 4200; // ms to complete cycle
    let holdStartTime = 0;
    let holdAnimFrame = null;
    let activeWordIndex = 0;
    const slides = overlay ? Array.from(overlay.querySelectorAll('.hero-hold-slide')) : [];

    // Split word letters for decode effect
    slides.forEach(slide => {
      const wordEl = slide.querySelector('.hero-hold-word');
      if (wordEl && !wordEl.dataset.prepared) {
        const text = wordEl.textContent.trim();
        wordEl.innerHTML = '';
        Array.from(text).forEach((char, idx) => {
          const span = document.createElement('span');
          span.className = 'hero-hold-letter';
          span.textContent = char;
          span.style.animationDelay = `${idx * 0.045}s`;
          wordEl.appendChild(span);
        });
        wordEl.dataset.prepared = 'true';
      }
    });

    function setSlide(idx) {
      activeWordIndex = idx % slides.length;
      slides.forEach((s, i) => {
        s.classList.toggle('is-active', i === activeWordIndex);
        if (i === activeWordIndex) {
          const letters = s.querySelectorAll('.hero-hold-letter');
          letters.forEach(l => {
            l.style.animation = 'none';
            l.offsetHeight; // trigger reflow
            l.style.animation = '';
          });
        }
      });
    }

    // Follower cursor lerp loop
    function cursorLoop() {
      if (isDesktop && cursorVisible) {
        cursorX += (pointerX - cursorX) * 0.18;
        cursorY += (pointerY - cursorY) * 0.18;
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    function startHold(e) {
      if (isHolding) return;
      isHolding = true;
      document.documentElement.classList.add('is-hero-hold-active');
      cursor.classList.add('is-holding');
      if (window.__technitelHold) window.__technitelHold.start();

      holdStartTime = performance.now();
      setSlide(0);

      function updateHold(now) {
        if (!isHolding) return;
        const elapsed = now - holdStartTime;
        const p = Math.min(1, elapsed / holdDuration);

        // Update progress ring offset
        progressRing.style.strokeDashoffset = ringCircumference * (1 - p);

        // Advance words: 3 steps over duration
        const step = Math.min(slides.length - 1, Math.floor(p * slides.length));
        if (step !== activeWordIndex) {
          setSlide(step);
        }

        if (p < 1) {
          holdAnimFrame = requestAnimationFrame(updateHold);
        } else {
          // Loop sequence continuously while held
          holdStartTime = performance.now();
          holdAnimFrame = requestAnimationFrame(updateHold);
        }
      }
      holdAnimFrame = requestAnimationFrame(updateHold);
    }

    function endHold() {
      if (!isHolding) return;
      isHolding = false;
      if (holdAnimFrame) cancelAnimationFrame(holdAnimFrame);
      progressRing.style.strokeDashoffset = ringCircumference;
      document.documentElement.classList.remove('is-hero-hold-active');
      cursor.classList.remove('is-holding');
      if (mobileTrigger) mobileTrigger.classList.remove('is-active');
      if (window.__technitelHold) window.__technitelHold.end();
    }

    if (isDesktop) {
      window.addEventListener('pointermove', e => {
        pointerX = e.clientX;
        pointerY = e.clientY;

        const target = e.target;
        const inHero = hero.contains(target);
        cursorShouldHide = !!target?.closest('button, a, [role="button"], input, select, textarea, .hero-showcase-img');

        if (inHero && !cursorShouldHide && !hero.hidden) {
          if (!cursorVisible) {
            cursorX = pointerX;
            cursorY = pointerY;
            cursor.classList.add('is-visible');
            cursor.classList.remove('is-hidden');
            cursorVisible = true;
          }
        } else {
          if (cursorVisible && !isHolding) {
            cursor.classList.add('is-hidden');
            cursor.classList.remove('is-visible');
            cursorVisible = false;
          }
        }
      });

      hero.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        if (e.target?.closest('button, a, [role="button"], input, .hero-showcase-img')) return;
        e.preventDefault();
        startHold(e);
      });

      window.addEventListener('pointerup', endHold);
      window.addEventListener('pointercancel', endHold);
      hero.addEventListener('pointerleave', () => {
        if (isHolding) endHold();
        if (cursorVisible) {
          cursor.classList.add('is-hidden');
          cursorVisible = false;
        }
      });
    }

    // Mobile Hold Trigger Toggle
    if (mobileTrigger) {
      mobileTrigger.addEventListener('click', e => {
        e.preventDefault();
        if (isHolding) {
          endHold();
        } else {
          startHold(e);
          mobileTrigger.classList.add('is-active');
        }
      });

      // Exit on background tap when in mobile hold
      overlay.addEventListener('click', () => {
        if (isHolding) endHold();
      });
    }
  }

  // ==========================================
  // 3. CEREBRIUM SCRAMBLE TEXT EFFECT
  // ==========================================
  function initScrambleEffect() {
    const chars = '01#_*/&!%X+=-<>';
    const elements = document.querySelectorAll('[data-scramble="true"], .nav a.l, .btn');

    elements.forEach(el => {
      // Find the text target
      const target = el.querySelector('span, b') || el;
      const originalText = target.textContent.trim();
      let timer = null;

      el.addEventListener('mouseenter', () => {
        let iteration = 0;
        clearInterval(timer);

        timer = setInterval(() => {
          target.textContent = originalText
            .split('')
            .map((letter, idx) => {
              if (idx < iteration) {
                return originalText[idx];
              }
              if (letter === ' ') return ' ';
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

          if (iteration >= originalText.length) {
            clearInterval(timer);
            target.textContent = originalText;
          }
          iteration += 1 / 2;
        }, 25);
      });

      el.addEventListener('mouseleave', () => {
        clearInterval(timer);
        target.textContent = originalText;
      });
    });
  }

  // ==========================================
  // 4. BENTO CARD SPOTLIGHT BORDER EFFECT
  // ==========================================
  function initSpotlightBorders() {
    const cards = document.querySelectorAll('[data-spotlight], .hl-card, .vendor, .card, .lt, .hero-showcase-frame');
    cards.forEach(card => {
      card.setAttribute('data-spotlight', 'true');
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);
      });
    });
  }

  // ==========================================
  // 5. ANIMATED NUMERIC COUNTERS
  // ==========================================
  function initMetricCounters() {
    const statElements = document.querySelectorAll('.hl-stats b');
    if (!statElements.length) return;

    let hasRun = false;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          statElements.forEach(el => {
            const text = el.textContent.trim();
            const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
            const suffix = text.replace(/[0-9]/g, '');
            if (isNaN(num)) return;

            let start = 0;
            const duration = 1600;
            const startTime = performance.now();

            function updateCounter(now) {
              const elapsed = now - startTime;
              const progress = Math.min(1, elapsed / duration);
              // easeOutCubic
              const ease = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(ease * num);
              el.textContent = current + suffix;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.textContent = text;
              }
            }
            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.2 });

    const highlightsSec = document.getElementById('highlights');
    if (highlightsSec) observer.observe(highlightsSec);
  }

  // ==========================================
  // BOOTSTRAP WHEN READY
  // ==========================================
  function init() {
    initThreeTelecomScene();
    initHeroHoldController();
    initScrambleEffect();
    initSpotlightBorders();
    initMetricCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
