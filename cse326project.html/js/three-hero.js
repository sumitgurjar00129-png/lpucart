/**
 * LPUcart - Three.js 3D Hero Scene
 * ==========================================
 * Interactive, high-performance 3D hero visualization:
 * 1. Realistic cardboard parcel box with custom canvas textures (LPUcart branding, tape, fragile barcode).
 * 2. Campus delivery electric scooter/cart carrying parcels.
 * 3. Floating mini-parcels, 3D map pin, and glowing particle field.
 * 4. Mouse parallax tracking with smooth lerp dampening.
 * 5. Tab visibility listener: pauses rendering when tab is hidden (saving CPU/battery).
 * 6. Automatic fallback to CSS 3D Box if Three.js, WebGL is missing or context is lost.
 */

(function initThreeHero() {
  const container = document.getElementById("hero-three-container");
  const fallback = document.getElementById("hero-css-fallback");

  // Show fallback if container is missing or Three.js CDN didn't load
  if (!container) return;

  function showFallback() {
    if (fallback) fallback.style.display = "flex";
    if (container) container.style.display = "none";
  }

  // Check WebGL and Three.js availability
  if (typeof THREE === "undefined") {
    console.warn("Three.js not loaded. Showing 3D CSS Fallback.");
    showFallback();
    return;
  }

  try {
    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 550;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Handle WebGL context lost gracefully
    renderer.domElement.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      console.warn("WebGL context lost. Switching to CSS 3D fallback.");
      showFallback();
    }, false);

    // 2. Lighting Setup (Vibrant Orange & Deep Campus Blue Theme)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Warm Sun / Campus Orange Key Light
    const keyLight = new THREE.DirectionalLight(0xff7a00, 1.4);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Deep Blue Accent / Rim Light
    const fillLight = new THREE.DirectionalLight(0x2563eb, 1.1);
    fillLight.position.set(-6, -2, -4);
    scene.add(fillLight);

    // Soft Front Glow Light
    const glowLight = new THREE.PointLight(0xffb703, 1.2, 10);
    glowLight.position.set(0, 1, 3);
    scene.add(glowLight);

    // 3. Procedural Textures via HTML5 Canvas (100% Offline & Reliable)
    function createBoxTexture() {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext("2d");

      // Cardboard Kraft background
      ctx.fillStyle = "#d49b5c";
      ctx.fillRect(0, 0, 512, 512);

      // Subtle texture noise / fibers
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      for (let i = 0; i < 400; i++) {
        ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 4 + 1, Math.random() * 2 + 1);
      }

      // Packing Tape across center
      ctx.fillStyle = "rgba(235, 175, 110, 0.9)";
      ctx.fillRect(0, 220, 512, 70);
      ctx.fillStyle = "rgba(180, 115, 60, 0.4)";
      ctx.fillRect(0, 220, 512, 3);
      ctx.fillRect(0, 287, 512, 3);

      // LPUcart Stamp / Brand
      ctx.fillStyle = "#0b192c";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText("LPUcart 📦", 40, 120);

      ctx.font = "bold 20px sans-serif";
      ctx.fillStyle = "#FF6A00";
      ctx.fillText("UNI MALL ➔ HOSTEL FASTWAY", 40, 160);

      // Barcode simulation
      ctx.fillStyle = "#1e293b";
      for (let x = 40; x < 260; x += Math.random() * 8 + 4) {
        ctx.fillRect(x, 340, Math.random() * 4 + 2, 60);
      }
      ctx.font = "14px monospace";
      ctx.fillText("* LPU-DELIVERY-2026 *", 40, 420);

      // Fragile Stamp Icon / Text
      ctx.strokeStyle = "#e11d48";
      ctx.lineWidth = 4;
      ctx.strokeRect(340, 330, 130, 90);
      ctx.fillStyle = "#e11d48";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText("FRAGILE", 360, 365);
      ctx.fillText("★ PRIORITY", 348, 395);

      return new THREE.CanvasTexture(c);
    }

    const boxTexture = createBoxTexture();
    const boxMaterial = new THREE.MeshStandardMaterial({
      map: boxTexture,
      roughness: 0.75,
      metalness: 0.1
    });

    // Main 3D Hero Group that pivots
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // 4. Main Parcel Box
    const parcelGeo = new THREE.BoxGeometry(2.2, 1.8, 2.0);
    const mainParcel = new THREE.Mesh(parcelGeo, boxMaterial);
    mainParcel.castShadow = true;
    mainParcel.receiveShadow = true;
    mainParcel.position.set(-0.6, 0.4, 0);
    heroGroup.add(mainParcel);

    // 5. Campus Delivery Bike / Cart
    const bikeGroup = new THREE.Group();
    bikeGroup.position.set(1.4, -0.4, 0.6);
    bikeGroup.scale.set(0.85, 0.85, 0.85);

    // Scooter Body / Deck
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e3e62, metalness: 0.5, roughness: 0.3 });
    const deckGeo = new THREE.BoxGeometry(2.4, 0.15, 0.8);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.castShadow = true;
    bikeGroup.add(deck);

    // Wheels (Front & Rear)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xFF6A00, metalness: 0.8, roughness: 0.2 });

    function makeWheel(xPos) {
      const wGroup = new THREE.Group();
      wGroup.position.set(xPos, -0.35, 0);

      // Tire
      const tireGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.25, 20);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, wheelMat);
      tire.castShadow = true;
      wGroup.add(tire);

      // Rim
      const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.26, 14);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wGroup.add(rim);

      return wGroup;
    }

    const frontWheel = makeWheel(1.1);
    const rearWheel = makeWheel(-1.1);
    bikeGroup.add(frontWheel);
    bikeGroup.add(rearWheel);

    // Steering Column & Handlebars
    const forkGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 12);
    forkGeo.rotateZ(-0.2);
    const forkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const fork = new THREE.Mesh(forkGeo, forkMat);
    fork.position.set(0.9, 0.65, 0);
    bikeGroup.add(fork);

    // Handlebar
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 10);
    const handle = new THREE.Mesh(handleGeo, forkMat);
    handle.position.set(0.78, 1.3, 0);
    bikeGroup.add(handle);

    // Scooter Headlight
    const lightGeo = new THREE.SphereGeometry(0.12, 14, 14);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xffeedd,
      emissive: 0xffaa00,
      emissiveIntensity: 1.2
    });
    const headlight = new THREE.Mesh(lightGeo, lightMat);
    headlight.position.set(1.05, 1.15, 0);
    bikeGroup.add(headlight);

    // Rear Delivery Box on Bike (Mini Parcel)
    const miniBoxMat = new THREE.MeshStandardMaterial({ color: 0xFF6A00, roughness: 0.5 });
    const miniBoxGeo = new THREE.BoxGeometry(0.9, 0.75, 0.75);
    const miniBox = new THREE.Mesh(miniBoxGeo, miniBoxMat);
    miniBox.position.set(-0.85, 0.45, 0);
    miniBox.castShadow = true;
    bikeGroup.add(miniBox);

    heroGroup.add(bikeGroup);

    // 6. Floating Mini Parcels & 3D Location Marker
    const floatGroup = new THREE.Group();
    heroGroup.add(floatGroup);

    // Floating Small Parcel 1
    const p1Geo = new THREE.BoxGeometry(0.65, 0.5, 0.55);
    const p1 = new THREE.Mesh(p1Geo, boxMaterial);
    p1.position.set(-2.2, 1.5, 0.5);
    p1.rotation.set(0.3, 0.5, -0.2);
    floatGroup.add(p1);

    // Floating Small Parcel 2
    const p2Geo = new THREE.BoxGeometry(0.5, 0.45, 0.45);
    const p2Mat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
    const p2 = new THREE.Mesh(p2Geo, p2Mat);
    p2.position.set(2.2, 1.8, -0.6);
    p2.rotation.set(-0.2, 0.8, 0.4);
    floatGroup.add(p2);

    // Floating 3D Map Pin
    const pinGroup = new THREE.Group();
    pinGroup.position.set(-0.6, 2.0, 0);

    const pinHeadGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3, roughness: 0.2 });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinMat);
    pinGroup.add(pinHead);

    const pinConeGeo = new THREE.ConeGeometry(0.18, 0.4, 16);
    pinConeGeo.rotateX(Math.PI);
    const pinCone = new THREE.Mesh(pinConeGeo, pinMat);
    pinCone.position.set(0, -0.22, 0);
    pinGroup.add(pinCone);

    heroGroup.add(pinGroup);

    // 7. Ambient Particle Swarm
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.08,
      transparent: true,
      opacity: 0.7
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 8. Interactive Mouse & Touch Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let targetCameraY = 1.8;
    let mouseX = 0;
    let mouseY = 0;

    function onMouseMove(event) {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (x >= -50 && x <= rect.width + 50 && y >= -50 && y <= rect.height + 50) {
        mouseX = (x / rect.width) * 2 - 1;
        mouseY = -(y / rect.height) * 2 + 1;
        targetRotationY = mouseX * 0.55;
        targetRotationX = -mouseY * 0.35;
        targetCameraY = 1.8 + mouseY * 0.25;
      }
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // 9. Window Resize & Orientation Handling
    function handleResize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // 10. Pause rendering when tab is hidden to save GPU / CPU
    let isTabVisible = true;
    document.addEventListener("visibilitychange", () => {
      isTabVisible = (document.visibilityState === "visible");
    });

    // 11. Animation Loop (Smooth 60 FPS)
    let clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);

      if (!isTabVisible) return; // Pause when tab not visible

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Gentle floating / bobbing effect
      mainParcel.position.y = 0.4 + Math.sin(time * 1.5) * 0.12;
      mainParcel.rotation.y += 0.005;

      bikeGroup.position.y = -0.4 + Math.sin(time * 1.8 + 1) * 0.08;
      frontWheel.rotation.x += 0.03;
      rearWheel.rotation.x += 0.03;

      // Floating mini items
      p1.position.y = 1.5 + Math.sin(time * 2.0) * 0.18;
      p1.rotation.y += 0.01;
      p1.rotation.x += 0.008;

      p2.position.y = 1.8 + Math.cos(time * 1.7) * 0.16;
      p2.rotation.y -= 0.012;

      pinGroup.position.y = 2.1 + Math.sin(time * 2.2) * 0.15;
      pinGroup.rotation.y = time * 0.8;

      // Particle drift
      particleField.rotation.y = time * 0.02;

      // Smooth mouse parallax lerp
      heroGroup.rotation.y += (targetRotationY - heroGroup.rotation.y) * 0.06;
      heroGroup.rotation.x += (targetRotationX - heroGroup.rotation.x) * 0.06;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    }

    animate();

    // Hide fallback if Three.js succeeded
    if (fallback) fallback.style.display = "none";
  } catch (err) {
    console.error("Three.js initialization failed:", err);
    showFallback();
  }
})();
