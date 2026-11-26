const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const hero = document.querySelector('.hero');
const stage = document.querySelector('#dc-stage');
const art = document.querySelector('.signature-window');
const gallery = document.querySelector('#galeria');
const controls = document.querySelector('.gallery-controls');
const progressBar = document.querySelector('.scroll-progress');
const motionToggle = document.querySelector('.motion-toggle');
let ambientPaused = false;
motionToggle.hidden = reduce.matches;
motionToggle.addEventListener('click', () => {
  ambientPaused = !ambientPaused;
  document.body.classList.toggle('ambient-paused', ambientPaused);
  motionToggle.setAttribute('aria-pressed', String(ambientPaused));
  motionToggle.textContent = ambientPaused ? 'Reanudar movimiento' : 'Pausar movimiento';
});

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

function initGallery() {
  const [previous, next] = controls.querySelectorAll('button');
  function updateControls() {
    previous.disabled = gallery.scrollLeft <= 2;
    next.disabled = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 2;
  }
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-direction]');
    if (!button) return;
    const distance = gallery.children[1].offsetLeft - gallery.children[0].offsetLeft;
    gallery.scrollBy({left: Number(button.dataset.direction) * distance, behavior: reduce.matches ? 'instant' : 'smooth'});
  });
  gallery.addEventListener('scroll', updateControls, {passive: true});
  window.addEventListener('resize', updateControls);
  updateControls();
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
}
window.addEventListener('scroll', scrollProgress, {passive: true});
scrollProgress();
initGallery();

async function initCinematics() {
  if (reduce.matches) return;
  await loadScript('./vendor/gsap.min.js');
  await loadScript('./vendor/ScrollTrigger.min.js');
  const {gsap, ScrollTrigger} = window;
  gsap.registerPlugin(ScrollTrigger);
  gsap.fromTo('.hero-grid > div', {y: 12, opacity: .65}, {y: 0, opacity: 1, duration: .7, ease: 'power3.out'});
  gsap.fromTo('.signature', {scale: .97, opacity: .65}, {scale: 1, opacity: 1, duration: .9, ease: 'power3.out'});
  const responsive = gsap.matchMedia();
  responsive.add({compact:'(max-width:680px)',wide:'(min-width:681px)'}, context => {
    const {compact} = context.conditions;
    const distance = compact ? 15 : 32;
    // Visible by default; each element returns to its starting position when scrolling back.
    const elements = document.querySelectorAll([
      '.proof .wrap', '.transform-grid > div:last-child',
      '#servicios > h2', '.service-list article', '.solutions-extra',
      '#proyectos > h2', '#proyectos > .intro', '.gallery-controls', '.project-list',
      '#caso-automatizacion h2', '#caso-automatizacion .workflow-visual',
      '#caso-automatizacion p:not(.eyebrow)', '#proceso > h2', '#proceso .steps li',
      '.about .split > div', '#soporte > div', '#preguntas h2', '.faq details',
      '.contact h2', '.contact .intro', '.contact form', 'footer .wrap'
    ].join(','));
    for (const element of elements) {
      gsap.fromTo(element, {y:distance, opacity:.78}, {
        y:0, opacity:1, ease:'none',
        scrollTrigger:{trigger:element,start:'top 96%',end:'top 66%',scrub:compact ? .25 : .45}
      });
    }
    gsap.fromTo('.signature-window .dc-poster', {y:0, rotation:0, scale:1}, {
      y:compact ? -9 : -18, rotation:compact ? 3 : 5, scale:1.06, ease:'none',
      scrollTrigger:{trigger:hero,start:'top 80px',end:'bottom 30%',scrub:.5}
    });
    gsap.fromTo('.workflow-step', {scale:.96, opacity:.75}, {
      scale:1, opacity:1, stagger:.16, ease:'none',
      scrollTrigger:{trigger:'.workflow-visual',start:'top 90%',end:'center 55%',scrub:.5}
    });
    gsap.fromTo('.about', {'--about-light':.05}, {'--about-light':.65,ease:'none',
      scrollTrigger:{trigger:'.about',start:'top 95%',end:'center 50%',scrub:.5}});
    gsap.timeline({scrollTrigger: {trigger: '#transformacion', start: 'top 90%', end: 'center 52%', scrub: .5}})
    .fromTo('.assembly-browser', {y: compact ? 18 : 65, rotateY: compact ? -12 : -23, scale: .89}, {y: 0, rotateY: -7, scale: 1, ease: 'none'}, 0)
    .fromTo('.assembly-phone', {x: compact ? 10 : 48, y: compact ? 18 : 65, rotate: 20}, {x: 0, y: 0, rotate: 8, ease: 'none'}, 0)
    .fromTo('.assembly-notification', {x: compact ? -8 : -25, y: compact ? 12 : 42, opacity: .6}, {x: 0, y: 0, opacity: 1, ease: 'none'}, .15);
  gsap.fromTo('#proceso .steps', {'--path-progress': 0}, {'--path-progress': 1, ease: 'none', scrollTrigger: {trigger: '#proceso', start: 'top 80%', end: 'center 45%', scrub: .55}});
  gsap.fromTo('.contact', {'--contact-light': .22}, {'--contact-light': .85, scrollTrigger: {trigger: '.contact', start: 'top 90%', end: 'center 55%', scrub: .7}});
  });
  for (const details of document.querySelectorAll('.faq details')) {
    details.addEventListener('toggle', () => {
      if (details.open) gsap.fromTo(details.querySelector('p'), {y:-4,opacity:.7}, {y:0,opacity:1,duration:.18,ease:'power2.out',clearProps:'transform,opacity'});
      ScrollTrigger.refresh();
    });
  }
  for (const link of document.querySelectorAll('.nav nav a')) {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) continue;
    ScrollTrigger.create({trigger: section, start: 'top 35%', end: 'bottom 35%', onToggle: self => {
      if (self.isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }});
  }
  if (finePointer.matches) {
    for (const button of document.querySelectorAll('.button')) {
      button.addEventListener('pointermove', event => {
        const bounds = button.getBoundingClientRect();
        gsap.to(button, {x: (event.clientX - bounds.left - bounds.width / 2) * .055, y: (event.clientY - bounds.top - bounds.height / 2) * .11, duration: .24, ease: 'power3.out', overwrite: true});
      });
      button.addEventListener('pointerleave', () => gsap.to(button, {x: 0, y: 0, duration: .3, ease: 'power3.out', overwrite: true}));
    }
  }
  // Low-memory phones retain the lightweight animated SVG.
  if (matchMedia('(max-width:680px)').matches && navigator.deviceMemory && navigator.deviceMemory < 3) return;
  await initThree(gsap, ScrollTrigger);
}

async function initThree(gsap, ScrollTrigger) {
  let renderer;
  try {
    const T = await import('./vendor/three.module.js');
    renderer = new T.WebGLRenderer({canvas: stage, antialias: true, alpha: true, powerPreference: 'low-power'});
    const compact = matchMedia('(max-width:680px)').matches;
    const tablet = matchMedia('(max-width:920px)').matches;
    renderer.setPixelRatio(Math.min(devicePixelRatio, compact ? 1 : tablet ? 1.2 : 1.65));
    renderer.setClearColor(0x0b0b12, 0);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(35, 1, .1, 100);
    camera.position.set(0, .18, 11.4);
    const sculpture = new T.Group();
    scene.add(sculpture);

    // Procedural studio environment for metallic reflections, no texture downloads.
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512; envCanvas.height = 256;
    const ctx = envCanvas.getContext('2d');
    ctx.fillStyle = '#100b1c'; ctx.fillRect(0, 0, 512, 256);
    const strips = [[20,25,90,155,'#e8e6ff'],[192,10,90,110,'#bda0ff'],[405,35,55,160,'#7849ef'],[0,190,512,20,'#352451']];
    for (const [x,y,w,h,color] of strips) {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
    const texture = new T.CanvasTexture(envCanvas);
    texture.mapping = T.EquirectangularReflectionMapping;
    texture.colorSpace = T.SRGBColorSpace;
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromEquirectangular(texture);
    scene.environment = environment.texture;
    texture.dispose();
    pmrem.dispose();

    const materialD = new T.MeshStandardMaterial({color:0xdad8e8, metalness:.85, roughness:.24, envMapIntensity:1.4});
    const materialC = new T.MeshPhysicalMaterial({color:0x7542e8, metalness:.65, roughness:.20, clearcoat:1, clearcoatRoughness:.17, envMapIntensity:1.8});
    const toXY = ([x,y]) => [(x - 80)*.04,(60 - y)*.04];
    function contour(points, shape) {
      points.map(toXY).forEach(([x,y], index) => index ? shape.lineTo(x,y) : shape.moveTo(x,y));
      shape.closePath();
      return shape;
    }
    const d = contour([[20,22],[65,22],[95,60],[65,98],[20,98]], new T.Shape());
    d.holes.push(contour([[43,45],[43,75],[54,75],[66,60],[54,45]],new T.Path()));
    const c = contour([[140,22],[103,22],[74,60],[103,98],[140,98],[140,77],[113,77],[100,60],[113,43],[140,43]], new T.Shape());
    const geometryOptions = {depth:.72, bevelEnabled:true, bevelSegments:3, steps:1, bevelSize:.068, bevelThickness:.068, curveSegments:8};
    const left = new T.Mesh(new T.ExtrudeGeometry(d,geometryOptions),materialD);
    const right = new T.Mesh(new T.ExtrudeGeometry(c,geometryOptions),materialC);
    left.position.z = -.36;
    right.position.z = -.06;
    sculpture.add(left,right);

    scene.add(new T.HemisphereLight(0xe5dcff,0x201133,2.0));
    const key = new T.DirectionalLight(0xffffff,3.4); key.position.set(-4,7,5); scene.add(key);
    const rim = new T.PointLight(0x9870ff,42,20,2); rim.position.set(4,2,2); scene.add(rim);
    const fill = new T.DirectionalLight(0x8b5cf6,2); fill.position.set(-2,-4,1); scene.add(fill);

    // A soft contact-shadow plane, generated procedurally.
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const shadowCtx = shadowCanvas.getContext('2d');
    const gradient = shadowCtx.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0,'rgba(0,0,0,.65)'); gradient.addColorStop(.6,'rgba(0,0,0,.27)'); gradient.addColorStop(1,'rgba(0,0,0,0)');
    shadowCtx.fillStyle = gradient; shadowCtx.fillRect(0,0,128,128);
    const shadowMap = new T.CanvasTexture(shadowCanvas);
    const floor = new T.Mesh(new T.PlaneGeometry(8,5),new T.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false}));
    floor.rotation.x = -Math.PI/2; floor.position.y = -2.05; scene.add(floor);

    // Luminous orbital particles use a shared generated texture and geometry.
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = particleCanvas.height = 32;
    const particleContext = particleCanvas.getContext('2d');
    const glow = particleContext.createRadialGradient(16,16,0,16,16,16);
    glow.addColorStop(0,'rgba(255,255,255,1)');
    glow.addColorStop(.2,'rgba(220,200,255,.95)');
    glow.addColorStop(.5,'rgba(170,130,255,.28)');
    glow.addColorStop(1,'rgba(170,130,255,0)');
    particleContext.fillStyle = glow;
    particleContext.fillRect(0,0,32,32);
    const particleMap = new T.CanvasTexture(particleCanvas);
    const particleGeometry = new T.PlaneGeometry(1,1);
    const particleMaterial = new T.MeshBasicMaterial({map:particleMap,transparent:true,depthWrite:false});
    const particles = Array.from({length:compact ? 6 : tablet ? 9 : 14}, (_,index) => {
      const particle = new T.Mesh(particleGeometry,particleMaterial);
      particle.scale.setScalar(.075 + index%3*.027);
      scene.add(particle);
      return particle;
    });
    const state = {progress:0, mouseX:0, mouseY:0};
    let visible = true;
    let frame = null;
    let disposed = false;
    let elapsed = 0;
    let lastTime = 0;
    let lastRender = 0;
    const frameInterval = compact ? 1000 / 24 : tablet ? 1000 / 30 : 1000 / 45;
    function draw(time = performance.now()) {
      frame = null;
      if (disposed || !visible || document.hidden) return;
      if (lastTime && !ambientPaused) elapsed += Math.min(time-lastTime,50) / 1000;
      lastTime = time;
      if (time-lastRender < frameInterval && !ambientPaused) { render(); return; }
      lastRender = time;
      const p = state.progress;
      const depth = compact ? .53 : tablet ? .75 : 1;
      const breathe = 1 - p*.7;
      const t = elapsed;
      sculpture.position.y = Math.sin(t*.8)*.065*breathe;
      sculpture.rotation.set(-.035 + p*.24*depth + state.mouseY + Math.sin(t*.63)*.042*breathe,
        -.07 + p*.75*depth + state.mouseX + Math.sin(t*.5)*.075*breathe,
        -.035 + p*.17*depth + Math.sin(t*.66)*.026*breathe);
      left.position.x = -p*.43*depth;
      right.position.x = p*.43*depth;
      left.position.z = -.36 + p*.31;
      right.position.z = -.06 - p*.35;
      camera.position.set(p*.45*depth,.18+p*.75*depth,(compact ? 12.1 : 11.4)-p*2.2*depth);
      camera.lookAt(0,0,0);
      rim.intensity = 42 + p*16 + Math.sin(t*.7)*4;
      for (let i=0; i<particles.length; i++) {
        const angle = t*.15*(i%2 ? -1 : 1) + i*2.399;
        const radius = 2.9 + (i%3)*.37;
        const particle = particles[i];
        particle.position.set(Math.cos(angle)*radius,Math.sin(angle)*radius*.54,Math.sin(angle+i)*1.35);
        particle.quaternion.copy(camera.quaternion);
      }
      renderer.render(scene,camera);
      art.classList.add('webgl-ready');
      if (!ambientPaused && !reduce.matches) render();
    }
    function render() {if (frame===null && !disposed && visible) frame=requestAnimationFrame(draw);}
    function resize() {
      const w = art.clientWidth, h = art.clientHeight;
      if (!w || !h) return;
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w,h,false); render();
    }
    const observer = new IntersectionObserver(entries => {visible=entries[0].isIntersecting;lastTime=0;if(visible)render();});
    observer.observe(art);
    const sizes = new ResizeObserver(resize); sizes.observe(art);
    motionToggle.addEventListener('click',render);
    const timeline = gsap.to(state,{progress:1,ease:'none',onUpdate:render,scrollTrigger:{trigger:hero,start:'top 80px',end:'bottom 75%',scrub:.6}});
    function pointer(event) {
      if (!finePointer.matches) return;
      const box = art.getBoundingClientRect();
      gsap.to(state,{mouseX:(event.clientX-box.left-box.width/2)/box.width*.18,mouseY:-(event.clientY-box.top-box.height/2)/box.height*.14,duration:.5,ease:'power3.out',onUpdate:render,overwrite:'auto'});
    }
    function resetPointer(){gsap.to(state,{mouseX:0,mouseY:0,duration:.5,ease:'power3.out',onUpdate:render,overwrite:'auto'});}
    function dispose() {
      if (disposed) return;
      disposed=true; observer.disconnect();sizes.disconnect();
      if(frame!==null)cancelAnimationFrame(frame);
      timeline.scrollTrigger?.kill();timeline.kill();gsap.killTweensOf(state);
      art.removeEventListener('pointermove',pointer);art.removeEventListener('pointerleave',resetPointer);
      document.removeEventListener('visibilitychange',render);
      motionToggle.removeEventListener('click',render);
      const geometries = new Set();
      const materials = new Set();
      scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)materials.add(object.material);});
      geometries.forEach(geometry=>geometry.dispose());
      materials.forEach(material=>material.dispose());
      particleMap.dispose();shadowMap.dispose();environment.dispose();renderer.dispose();
      art.classList.remove('webgl-ready');
    }
    stage.addEventListener('webglcontextlost', event=>{event.preventDefault();dispose();},{once:true});
    window.addEventListener('pagehide',dispose,{once:true});
    document.addEventListener('visibilitychange',render);
    art.addEventListener('pointermove',pointer,{passive:true});art.addEventListener('pointerleave',resetPointer);
    resize();
    reduce.addEventListener('change',event=>{if(event.matches)dispose();},{once:true});
  } catch (error) {
    renderer?.dispose();
    console.warn('DCastro: visual 3D no disponible, se utiliza la imagen de respaldo.',error);
  }
}

if (!reduce.matches) {
  const launch = () => initCinematics().catch(error => console.warn('DCastro: animación opcional no disponible.',error));
  if (document.readyState === 'complete') launch();
  else window.addEventListener('load',launch,{once:true});
}
