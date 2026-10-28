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

    // 110 Telecom Transmission Nodes (softened to keep globe as focal point)
    const nodeCount = 110;
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
      size: 8,
      vertexColors: true,
      map: glowTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    group.add(nodePoints);

    // Fiber Optic Interconnect Lines (delicate ambient network)
    const maxLineSegs = 160;
    const linePositions = new Float32Array(maxLineSegs * 6);
    const lineColors = new Float32Array(maxLineSegs * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.20,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineSegments);

    // Traveling Data Packets
    const packetCount = 28;
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
      size: 7,
      vertexColors: true,
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const packetPoints = new THREE.Points(packetGeo, packetMat);
    group.add(packetPoints);

    // ==========================================
    // PROMINENT TELECOMMUNICATIONS HOLOGRAPHIC GLOBE
    // Anchored directly in scene on the animation side
    // ==========================================
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Responsive layout for globe positioning
    function updateGlobeLayout() {
      const isMobile = width < 768;
      const isTablet = width < 1024;
      if (isMobile) {
        globeGroup.position.set(0, -28, -60);
        globeGroup.scale.setScalar(0.75);
      } else if (isTablet) {
        globeGroup.position.set(70, -12, -50);
        globeGroup.scale.setScalar(0.90);
      } else {
        globeGroup.position.set(130, -8, -45);
        globeGroup.scale.setScalar(1.05);
      }
    }
    updateGlobeLayout();

    // 1. Atmospheric Backlight Halo Aura (Frames the globe brightly against dark background)
    function createAtmosphereTexture() {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 15, 64, 64, 64);
      g.addColorStop(0, 'rgba(255, 45, 55, 0.70)');
      g.addColorStop(0.35, 'rgba(225, 38, 45, 0.40)');
      g.addColorStop(0.7, 'rgba(255, 95, 102, 0.16)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    }
    const atmosphereTex = createAtmosphereTexture();
    const haloMat = new THREE.SpriteMaterial({
      map: atmosphereTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const haloSprite = new THREE.Sprite(haloMat);
    haloSprite.scale.set(260, 260, 1);
    globeGroup.add(haloSprite);

    // 2. Inner Occluding Volumetric Core (Gives the globe real 3D presence & depth occlusion)
    const coreGeo = new THREE.SphereGeometry(82.4, 32, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x0c0204,
      transparent: true,
      opacity: 0.90,
      depthWrite: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 3. Inner Glowing Energy Core (Pulsing telecom core)
    const pulseGeo = new THREE.SphereGeometry(50, 22, 18);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0xff2830,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    globeGroup.add(pulseMesh);

    // 4. Primary High-Definition Geodesic Globe Wireframe
    const globeGeo = new THREE.IcosahedronGeometry(84, 2);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0xff252d,
      wireframe: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // 5. Latitude & Longitude Digital Meridian Network
    const meridianGeo = new THREE.SphereGeometry(83.6, 24, 14);
    const meridianMat = new THREE.MeshBasicMaterial({
      color: 0xff8088,
      wireframe: true,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending
    });
    const meridianMesh = new THREE.Mesh(meridianGeo, meridianMat);
    globeGroup.add(meridianMesh);

    // 6. Luminous Telecom Station Nodes on Globe Surface
    const globePosAttr = globeGeo.attributes.position;
    const gVertCount = globePosAttr.count;
    const gNodePositions = new Float32Array(gVertCount * 3);
    const gNodeColors = new Float32Array(gVertCount * 3);

    for (let i = 0; i < gVertCount; i++) {
      gNodePositions[i * 3] = globePosAttr.getX(i);
      gNodePositions[i * 3 + 1] = globePosAttr.getY(i);
      gNodePositions[i * 3 + 2] = globePosAttr.getZ(i);

      if (i % 4 === 0) {
        // Bright white major exchange hubs
        gNodeColors[i * 3] = 1.0;
        gNodeColors[i * 3 + 1] = 1.0;
        gNodeColors[i * 3 + 2] = 1.0;
      } else if (i % 2 === 0) {
        // Vivid crimson regional nodes
        gNodeColors[i * 3] = 1.0;
        gNodeColors[i * 3 + 1] = 0.35;
        gNodeColors[i * 3 + 2] = 0.40;
      } else {
        // Soft red transmission points
        gNodeColors[i * 3] = 0.95;
        gNodeColors[i * 3 + 1] = 0.15;
        gNodeColors[i * 3 + 2] = 0.22;
      }
    }

    const gNodeGeo = new THREE.BufferGeometry();
    gNodeGeo.setAttribute('position', new THREE.BufferAttribute(gNodePositions, 3));
    gNodeGeo.setAttribute('color', new THREE.BufferAttribute(gNodeColors, 3));

    const gNodeMat = new THREE.PointsMaterial({
      size: 12,
      vertexColors: true,
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const globeNodes = new THREE.Points(gNodeGeo, gNodeMat);
    globeGroup.add(globeNodes);

    // 7. Dynamic Orbital Rings & Satellites
    const ringGeo1 = new THREE.TorusGeometry(106, 0.9, 16, 90);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xff3b43,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.34;
    ring1.rotation.y = Math.PI * 0.15;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(125, 0.7, 16, 90);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.46,
      blending: THREE.AdditiveBlending
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.26;
    ring2.rotation.y = Math.PI * 0.38;
    globeGroup.add(ring2);

    const ringGeo3 = new THREE.TorusGeometry(144, 0.5, 16, 90);
    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0xff7077,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending
    });
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.x = Math.PI * 0.65;
    ring3.rotation.y = -Math.PI * 0.20;
    globeGroup.add(ring3);

    // Orbiting Satellite Transmission Beacons
    const satGeo = new THREE.BufferGeometry();
    const satPos = new Float32Array(3 * 3);
    const satCol = new Float32Array([
      1.0, 1.0, 1.0,      // Sat 1: White
      1.0, 0.32, 0.38,    // Sat 2: Vivid Red
      1.0, 0.82, 0.88     // Sat 3: Rose Silver
    ]);
    satGeo.setAttribute('position', new THREE.BufferAttribute(satPos, 3));
    satGeo.setAttribute('color', new THREE.BufferAttribute(satCol, 3));
    const satMat = new THREE.PointsMaterial({
      size: 14,
      vertexColors: true,
      map: glowTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const satellitePoints = new THREE.Points(satGeo, satMat);
    globeGroup.add(satellitePoints);

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
      if (typeof updateGlobeLayout === 'function') {
        updateGlobeLayout();
      }
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

      // Rotate group & prominent core globe
      const rotSpeed = 0.0012 + warpFactor * 0.008;
      group.rotation.y += rotSpeed;
      group.rotation.x = Math.sin(clock * 0.3) * 0.05;

      // Interactive tilt of globe towards mouse
      globeGroup.rotation.y = mouseX * 0.16;
      globeGroup.rotation.x = -mouseY * 0.12;

      // Synchronous continuous rotation of globe wireframe, meridian grid, and surface nodes
      const globeRotY = 0.006 + warpFactor * 0.025;
      const globeRotX = 0.0025;
      globeMesh.rotation.y += globeRotY;
      globeMesh.rotation.x += globeRotX;
      meridianMesh.rotation.y += globeRotY;
      meridianMesh.rotation.x += globeRotX;
      globeNodes.rotation.y += globeRotY;
      globeNodes.rotation.x += globeRotX;

      // Pulse internal energy core and atmospheric halo
      const pulseWave = Math.sin(clock * 2.5);
      pulseMesh.scale.setScalar(1 + pulseWave * 0.06);
      pulseMat.opacity = 0.40 + pulseWave * 0.12;
      haloSprite.scale.set(260 + pulseWave * 12, 260 + pulseWave * 12, 1);

      // Orbiting rings rotation
      ring1.rotation.z += 0.009 + warpFactor * 0.025;
      ring2.rotation.z -= 0.007 + warpFactor * 0.02;
      ring3.rotation.z += 0.005 + warpFactor * 0.015;

      // Orbiting satellites along rings
      const satPosArr = satGeo.attributes.position.array;
      const sAngle1 = clock * 1.5;
      const sVec1 = new THREE.Vector3(Math.cos(sAngle1) * 106, Math.sin(sAngle1) * 106, 0).applyEuler(ring1.rotation);
      satPosArr[0] = sVec1.x; satPosArr[1] = sVec1.y; satPosArr[2] = sVec1.z;

      const sAngle2 = -clock * 1.2;
      const sVec2 = new THREE.Vector3(Math.cos(sAngle2) * 125, Math.sin(sAngle2) * 125, 0).applyEuler(ring2.rotation);
      satPosArr[3] = sVec2.x; satPosArr[4] = sVec2.y; satPosArr[5] = sVec2.z;

      const sAngle3 = clock * 0.85;
      const sVec3 = new THREE.Vector3(Math.cos(sAngle3) * 144, Math.sin(sAngle3) * 144, 0).applyEuler(ring3.rotation);
      satPosArr[6] = sVec3.x; satPosArr[7] = sVec3.y; satPosArr[8] = sVec3.z;
      satGeo.attributes.position.needsUpdate = true;

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

      // Dynamic Fiber Optic Connections (delicate background network so globe is prominent)
      let lineIdx = 0;
      const lPos = lineGeo.attributes.position.array;
      const lCol = lineGeo.attributes.color.array;
      const maxDist = 76 + warpFactor * 20;

      for (let i = 0; i < nodeCount && lineIdx < maxLineSegs; i++) {
        for (let j = i + 1; j < nodeCount && lineIdx < maxLineSegs; j++) {
          const dx = positions[i * 3] - positions[j * 3];
          const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
          const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (0.22 + warpFactor * 0.35);

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

    let step = 0;
    function loop() {
      step += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Subtle background fiber optic network
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(225, 38, 45, 0.6)';
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
          if (dist < 75) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = `rgba(225, 38, 45, ${0.22 * (1 - dist / 75)})`;
            ctx.stroke();
          }
        }
      }

      // Prominent Holographic Telecom Globe in 2D fallback
      const globeCx = width > 900 ? width * 0.72 : width * 0.5;
      const globeCy = height * 0.5;
      const globeR = Math.min(width * 0.22, height * 0.28, 110);

      // Globe atmospheric glow
      const grad = ctx.createRadialGradient(globeCx, globeCy, globeR * 0.2, globeCx, globeCy, globeR * 1.4);
      grad.addColorStop(0, 'rgba(255, 45, 55, 0.45)');
      grad.addColorStop(0.6, 'rgba(225, 38, 45, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(globeCx, globeCy, globeR * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Main globe outline
      ctx.strokeStyle = 'rgba(255, 45, 55, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(globeCx, globeCy, globeR, 0, Math.PI * 2);
      ctx.stroke();

      // Longitude / latitude grid
      ctx.strokeStyle = 'rgba(255, 115, 120, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(globeCx, globeCy, Math.abs(Math.sin(step * 0.5)) * globeR, globeR, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(globeCx, globeCy, globeR, globeR * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Orbital ring
      ctx.save();
      ctx.translate(globeCx, globeCy);
      ctx.rotate(0.35);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, globeR * 1.35, globeR * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      requestAnimationFrame(loop);
    }
    loop();
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
    initSpotlightBorders();
    initMetricCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
