import * as React from "react";
import { gsap } from "gsap";

interface CrocsData {
  title: string;
  image: string;
  category: string;
  year: string;
  description: string;
  color: string;
}

const CROCS_DATA: CrocsData[] = [
  {
    title: "Classic Clog",
    image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=1915&auto=format&fit=crop",
    category: "Iconic Style",
    year: "2025",
    description: "The original comfort icon",
    color: "#22c55e",
  },
  {
    title: "LiteRide 360",
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop",
    category: "Performance",
    year: "2024",
    description: "Next-gen cushioning",
    color: "#3b82f6",
  },
  {
    title: "Crush Collection",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1770&auto=format&fit=crop",
    category: "Platform",
    year: "2024",
    description: "Elevated style statement",
    color: "#ec4899",
  },
  {
    title: "Classic Lined",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
    category: "Cozy Comfort",
    year: "2023",
    description: "Warm fuzzy feelings",
    color: "#f59e0b",
  },
  {
    title: "Echo Collection",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1887&auto=format&fit=crop",
    category: "Future Forward",
    year: "2024",
    description: "Bold new silhouettes",
    color: "#8b5cf6",
  },
];

const CONFIG = {
  SCROLL_SPEED: 0.75,
  LERP_FACTOR: 0.05,
  BUFFER_SIZE: 5,
  MAX_VELOCITY: 150,
  SNAP_DURATION: 500,
};

const lerp = (start: number, end: number, factor: number) =>
  start + (end - start) * factor;

const getCrocsData = (index: number) => {
  const i = ((Math.abs(index) % CROCS_DATA.length) + CROCS_DATA.length) % CROCS_DATA.length;
  return CROCS_DATA[i];
};

const getItemNumber = (index: number) => {
  return (((Math.abs(index) % CROCS_DATA.length) + CROCS_DATA.length) % CROCS_DATA.length + 1)
    .toString()
    .padStart(2, "0");
};

// Split text into characters for animation
const SplitText: React.FC<{ text: string; className?: string; revealed?: boolean }> = ({
  text,
  className = "",
  revealed = true
}) => {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`title-char ${revealed ? 'revealed' : ''}`}
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

export function CrocsSlider() {
  const [visibleRange, setVisibleRange] = React.useState({
    min: -CONFIG.BUFFER_SIZE,
    max: CONFIG.BUFFER_SIZE,
  });
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [titleKey, setTitleKey] = React.useState(0);

  const state = React.useRef({
    currentY: 0,
    targetY: 0,
    isDragging: false,
    isSnapping: false,
    snapStart: { time: 0, y: 0, target: 0 },
    lastScrollTime: Date.now(),
    dragStart: { y: 0, scrollY: 0 },
    projectHeight: 0,
    minimapHeight: 350,
    lastIndex: 0,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);
  const descriptionRef = React.useRef<HTMLParagraphElement>(null);
  const progressRef = React.useRef<HTMLDivElement>(null);
  const glowRef = React.useRef<HTMLDivElement>(null);
  const projectsRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const minimapRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const infoRef = React.useRef<Map<number, HTMLDivElement>>(new Map());
  const requestRef = React.useRef<number>();

  // GSAP animations on mount
  React.useEffect(() => {
    const ctx = gsap.context(() => {
      // Header entrance with stagger
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 }
      );

      // Logo character animation
      gsap.fromTo(
        ".logo-char",
        { y: -50, opacity: 0, rotateX: -90 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          stagger: 0.08,
          delay: 0.4
        }
      );

      // Tagline slide in
      gsap.fromTo(
        ".crocs-tagline",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 1 }
      );

      // Minimap entrance
      gsap.fromTo(
        ".minimap",
        { x: 200, opacity: 0, scale: 0.8 },
        { x: 0, opacity: 1, scale: 1, duration: 1.4, ease: "elastic.out(1, 0.5)", delay: 0.5 }
      );

      // Scroll indicator
      gsap.fromTo(
        ".scroll-indicator",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 1.2 }
      );

      // Floating animation for decorative elements
      gsap.to(".floating-orb", {
        y: -30,
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.5,
      });

      // Glow pulse
      gsap.to(".glow-effect", {
        scale: 1.2,
        opacity: 0.6,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // Counter number animation
      gsap.fromTo(
        ".counter-current",
        { scale: 0, rotateY: -180 },
        { scale: 1, rotateY: 0, duration: 1, ease: "back.out(1.7)", delay: 0.8 }
      );
    });

    return () => ctx.revert();
  }, []);

  // Animate on index change
  React.useEffect(() => {
    const data = getCrocsData(currentIndex);

    // Trigger title re-render with new key for animation
    setTitleKey(prev => prev + 1);

    // Animate description
    if (descriptionRef.current) {
      gsap.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.3 }
      );
    }

    // Animate glow color
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        background: `radial-gradient(circle at 30% 50%, ${data.color}40 0%, transparent 50%)`,
        duration: 0.8,
        ease: "power2.out",
      });
    }

    // Progress bar
    if (progressRef.current) {
      const progress = ((Math.abs(currentIndex) % CROCS_DATA.length) / (CROCS_DATA.length - 1)) * 100;
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        backgroundColor: data.color,
        duration: 0.6,
        ease: "power2.out",
      });
    }

    // Counter animation
    gsap.fromTo(
      ".counter-current",
      { scale: 1.3, opacity: 0.5 },
      { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
    );

  }, [currentIndex]);

  const updateParallax = (
    img: HTMLImageElement | null,
    scroll: number,
    index: number,
    height: number
  ) => {
    if (!img) return;
    if (!img.dataset.parallaxCurrent) {
      img.dataset.parallaxCurrent = "0";
    }
    let current = parseFloat(img.dataset.parallaxCurrent);
    const target = (-scroll - index * height) * 0.2;
    current = lerp(current, target, 0.1);
    if (Math.abs(current - target) > 0.01) {
      img.style.transform = `translateY(${current}px) scale(1.5)`;
      img.dataset.parallaxCurrent = current.toString();
    }
  };

  const updateSnap = () => {
    const s = state.current;
    const progress = Math.min((Date.now() - s.snapStart.time) / CONFIG.SNAP_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    s.targetY = s.snapStart.y + (s.snapStart.target - s.snapStart.y) * eased;
    if (progress >= 1) s.isSnapping = false;
  };

  const snapToProject = () => {
    const s = state.current;
    const current = Math.round(-s.targetY / s.projectHeight);
    const target = -current * s.projectHeight;
    s.isSnapping = true;
    s.snapStart = { time: Date.now(), y: s.targetY, target };
  };

  const updatePositions = () => {
    const s = state.current;
    const minimapY = (s.currentY * s.minimapHeight) / s.projectHeight;

    projectsRef.current.forEach((el, index) => {
      const y = index * s.projectHeight + s.currentY;
      el.style.transform = `translateY(${y}px)`;
      const img = el.querySelector("img");
      updateParallax(img, s.currentY, index, s.projectHeight);
    });

    minimapRef.current.forEach((el, index) => {
      const y = index * s.minimapHeight + minimapY;
      el.style.transform = `translateY(${y}px)`;
      const img = el.querySelector("img");
      if (img) {
        updateParallax(img, minimapY, index, s.minimapHeight);
      }
    });

    infoRef.current.forEach((el, index) => {
      const y = index * s.minimapHeight + minimapY;
      el.style.transform = `translateY(${y}px)`;
    });
  };

  const animate = () => {
    const s = state.current;
    const now = Date.now();

    if (!s.isSnapping && !s.isDragging && now - s.lastScrollTime > 100) {
      const snapPoint = -Math.round(-s.targetY / s.projectHeight) * s.projectHeight;
      if (Math.abs(s.targetY - snapPoint) > 1) snapToProject();
    }

    if (s.isSnapping) updateSnap();
    if (!s.isDragging) {
      s.currentY += (s.targetY - s.currentY) * CONFIG.LERP_FACTOR;
    }

    updatePositions();

    // Track current index for UI updates
    const idx = Math.round(-s.targetY / s.projectHeight);
    if (idx !== s.lastIndex) {
      s.lastIndex = idx;
      setCurrentIndex(idx);
    }
  };

  const renderedRange = React.useRef({ min: -CONFIG.BUFFER_SIZE, max: CONFIG.BUFFER_SIZE });

  const animationLoop = () => {
    animate();

    const s = state.current;
    const idx = Math.round(-s.targetY / s.projectHeight);
    const min = idx - CONFIG.BUFFER_SIZE;
    const max = idx + CONFIG.BUFFER_SIZE;

    if (min !== renderedRange.current.min || max !== renderedRange.current.max) {
      renderedRange.current = { min, max };
      setVisibleRange({ min, max });
    }

    requestRef.current = requestAnimationFrame(animationLoop);
  };

  React.useEffect(() => {
    state.current.projectHeight = window.innerHeight;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const s = state.current;
      s.isSnapping = false;
      s.lastScrollTime = Date.now();
      const delta = Math.max(
        Math.min(e.deltaY * CONFIG.SCROLL_SPEED, CONFIG.MAX_VELOCITY),
        -CONFIG.MAX_VELOCITY
      );
      s.targetY -= delta;
    };

    const onTouchStart = (e: TouchEvent) => {
      const s = state.current;
      s.isDragging = true;
      s.isSnapping = false;
      s.dragStart = { y: e.touches[0].clientY, scrollY: s.targetY };
      s.lastScrollTime = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = state.current;
      if (!s.isDragging) return;
      s.targetY = s.dragStart.scrollY + (e.touches[0].clientY - s.dragStart.y) * 1.5;
      s.lastScrollTime = Date.now();
    };

    const onTouchEnd = () => {
      state.current.isDragging = false;
    };

    const onResize = () => {
      state.current.projectHeight = window.innerHeight;
      const container = document.querySelector(".parallax-container") as HTMLElement;
      if (container) {
        container.style.height = `${window.innerHeight}px`;
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("resize", onResize);

    onResize();
    requestRef.current = requestAnimationFrame(animationLoop);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const indices = [];
  for (let i = visibleRange.min; i <= visibleRange.max; i++) {
    indices.push(i);
  }

  const currentData = getCrocsData(currentIndex);

  return (
    <div className="parallax-container" ref={containerRef}>
      {/* Dynamic glow background */}
      <div className="glow-effect" ref={glowRef} />

      {/* Floating orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      {/* Brand Header */}
      <header className="crocs-header" ref={headerRef}>
        <div className="header-left">
          <span className="crocs-logo glitch-text" data-text="CROCS">
            {"CROCS".split("").map((char, i) => (
              <span key={i} className="logo-char">{char}</span>
            ))}
          </span>
          <div className="progress-bar">
            <div className="progress-fill" ref={progressRef} />
          </div>
        </div>
        <span className="crocs-tagline">Come As You Are</span>
      </header>

      {/* Big Title Overlay */}
      <div className="big-title-container">
        <h1 className="big-title" key={titleKey}>
          <SplitText text={currentData.title} revealed={true} />
        </h1>
        <div className="big-title-meta">
          <span className="meta-item revealed" style={{ animationDelay: '0.5s' }}>
            {currentData.category}
          </span>
          <span className="meta-divider meta-item revealed" style={{ animationDelay: '0.6s' }}>•</span>
          <span className="meta-item revealed" style={{ animationDelay: '0.7s' }}>
            {currentData.year}
          </span>
        </div>
        <p className="big-description revealed" ref={descriptionRef}>
          {currentData.description}
        </p>
      </div>

      <ul className="project-list">
        {indices.map((i) => {
          const data = getCrocsData(i);
          return (
            <div
              key={i}
              className="project"
              ref={(el) => {
                if (el) projectsRef.current.set(i, el);
                else projectsRef.current.delete(i);
              }}
            >
              <img src={data.image} alt={data.title} />
              <div className="project-overlay" style={{ background: `linear-gradient(135deg, ${data.color}30 0%, transparent 60%)` }} />
            </div>
          );
        })}
      </ul>

      <div className="minimap">
        <div className="minimap-wrapper">
          <div className="minimap-img-preview">
            <div className="minimap-frame" />
            {indices.map((i) => {
              const data = getCrocsData(i);
              return (
                <div
                  key={i}
                  className="minimap-img-item"
                  ref={(el) => {
                    if (el) minimapRef.current.set(i, el);
                    else minimapRef.current.delete(i);
                  }}
                >
                  <img src={data.image} alt={data.title} />
                </div>
              );
            })}
          </div>
          <div className="minimap-info-list">
            {indices.map((i) => {
              const data = getCrocsData(i);
              const num = getItemNumber(i);
              return (
                <div
                  key={i}
                  className="minimap-item-info"
                  ref={(el) => {
                    if (el) infoRef.current.set(i, el);
                    else infoRef.current.delete(i);
                  }}
                >
                  <div className="minimap-item-info-row title-row">
                    <p className="item-number">{num}</p>
                    <p className="item-title">{data.title}</p>
                  </div>
                  <div className="minimap-item-info-row category-row">
                    <p>{data.category}</p>
                    <p>{data.year}</p>
                  </div>
                  <div className="minimap-item-info-row description-row">
                    <p>{data.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="minimap-counter">
          <span className="counter-current">{getItemNumber(currentIndex)}</span>
          <span className="counter-divider">/</span>
          <span className="counter-total">{CROCS_DATA.length.toString().padStart(2, "0")}</span>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-line" />
      </div>
    </div>
  );
}
