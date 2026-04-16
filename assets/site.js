window.MSPSite = (() => {
  const firebaseConfig = {
    apiKey: "AIzaSyC1pKUto9-16yt6jcYxzyPOfF4VBWeAit4",
    authDomain: "booking-8bc2d.firebaseapp.com",
    projectId: "booking-8bc2d"
  };

  const navLinks = [
    { href: "index.html", label: "Home", page: "home" },
    { href: "about.html", label: "About", page: "about" },
    { href: "services.html", label: "Services", page: "services" },
    { href: "work-with-us.html", label: "Work With Us", page: "work" },
    { href: "contact.html", label: "Contact", page: "contact" }
  ];

  function initFirebase() {
    if (window.firebase && !window.firebase.apps.length) {
      window.firebase.initializeApp(firebaseConfig);
    }
    return window.firebase;
  }

  function renderChrome() {
    const page = document.body.dataset.page || "";
    const header = document.getElementById("site-header");
    const footer = document.getElementById("site-footer");

    if (header) {
      header.innerHTML = `
        <div class="site-topbar">
          <a class="brand-lockup" href="index.html" aria-label="MSP 790 Payback Music home" aria-expanded="true">
            <span class="brand-mark" aria-hidden="true">
              <img src="assets/msp-logo-mark.svg" alt="">
            </span>
            <span class="brand-text">
              <strong>MSP 790</strong>
              <span>Payback Music</span>
            </span>
          </a>
          <div class="top-actions">
            <a class="chip-link" href="client-auth.html">Client Portal</a>
            <a class="chip-link" href="login.html">Admin</a>
          </div>
        </div>
        <div class="nav-shell">
          <div class="nav-surface">
            <nav class="site-nav" aria-label="Primary">
              ${navLinks.map(link => `<a class="nav-link${page === link.page ? " active" : ""}" href="${link.href}" data-short="${link.label.charAt(0)}"><span class="nav-label">${link.label}</span></a>`).join("")}
            </nav>
          </div>
        </div>
      `;
    }

    if (footer) {
      footer.innerHTML = `
        <div class="section-shell site-footer">
          <div class="section-body footer-grid">
            <div>
              <p class="eyebrow">MSP 790 Payback Music</p>
              <h3>Build Something Real</h3>
              <p>Artist development, visuals, choreography, audio, and digital work shaped around momentum and discipline.</p>
            </div>
            <div class="footer-links">
              <a href="services.html">Services</a>
              <a href="work-with-us.html">Work With Us</a>
              <a href="about.html">About</a>
            </div>
            <div class="footer-links">
              <a href="contact.html">Contact</a>
              <a href="privacy.html">Privacy</a>
              <a href="terms.html">Terms</a>
              <a href="client-auth.html">Client Portal</a>
            </div>
          </div>
        </div>
      `;
    }
  }

  function mountCarousel(root) {
    const track = root.querySelector(".carousel-track");
    if (!track) return;
    const slides = [...track.children];
    let index = 0;
    const update = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
    };
    root.querySelectorAll("[data-carousel-action]").forEach(button => {
      button.addEventListener("click", () => {
        const dir = button.dataset.carouselAction === "next" ? 1 : -1;
        index = (index + dir + slides.length) % slides.length;
        update();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderChrome();
    if (document.body.dataset.page === "home") {
      const homeBody = document.body;
      const brandLockup = document.querySelector(".brand-lockup");
      const scrollHint = document.getElementById("scrollHint");
      let railMotionTimer;
      let railShownByScroll = false;
      const setRailCollapsed = (collapsed, animate = false) => {
        homeBody.classList.remove("home-rail-collapsing", "home-rail-expanding");
        if (animate) {
          homeBody.classList.add(collapsed ? "home-rail-collapsing" : "home-rail-expanding");
          clearTimeout(railMotionTimer);
          railMotionTimer = window.setTimeout(() => {
            homeBody.classList.remove("home-rail-collapsing", "home-rail-expanding");
          }, 860);
        }
        homeBody.classList.toggle("home-rail-collapsed", collapsed);
        brandLockup?.setAttribute("aria-expanded", String(!collapsed));
      };
      const setRailVisibility = visible => {
        if (!visible) {
          railShownByScroll = false;
          setRailCollapsed(true, false);
          homeBody.classList.remove("home-rail-visible");
          homeBody.classList.add("home-rail-hidden");
          return;
        }
        homeBody.classList.remove("home-rail-hidden");
        if (!railShownByScroll) {
          setRailCollapsed(false, false);
          homeBody.classList.add("home-rail-visible");
          railShownByScroll = true;
          window.setTimeout(() => {
            homeBody.classList.remove("home-rail-visible");
          }, 940);
        }
      };
      const updateHomeScrollScene = () => {
        const scrollY = window.scrollY;
        const railRevealThreshold = Math.max(180, window.innerHeight * 0.24);
        setRailVisibility(scrollY > railRevealThreshold);
        if (scrollY > 80) {
          homeBody.classList.remove("home-show-scroll-hint");
          scrollHint?.setAttribute("aria-hidden", "true");
        }
      };
      const updateRailState = () => {
        brandLockup?.setAttribute("aria-expanded", String(!homeBody.classList.contains("home-rail-collapsed")));
      };
      brandLockup?.addEventListener("click", event => {
        event.preventDefault();
        homeBody.classList.remove("home-rail-hidden");
        railShownByScroll = true;
        const willCollapse = !homeBody.classList.contains("home-rail-collapsed");
        setRailCollapsed(willCollapse, true);
        updateRailState();
      });
      updateHomeScrollScene();
      window.addEventListener("scroll", updateHomeScrollScene, { passive: true });
      window.addEventListener("resize", updateHomeScrollScene);
      updateRailState();
    }
    document.querySelectorAll(".carousel").forEach(mountCarousel);
  });

  return {
    initFirebase,
    renderChrome
  };
})();
