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
        ${page === "home" ? `
          <button class="rail-tab-toggle" type="button" aria-label="Open sidebar" title="Open sidebar" aria-expanded="false">
            <span class="rail-tab-mark" aria-hidden="true">
              <img src="assets/msp-logo-mark.svg" alt="">
            </span>
          </button>
        ` : ""}
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
              ${navLinks.map(link => `<a class="nav-link${page === link.page ? " active" : ""}" href="${link.href}" data-short="${link.label.charAt(0)}" title="${link.label}" aria-label="${link.label}"><span class="nav-label">${link.label}</span></a>`).join("")}
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

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function initializeGallery() {
    const galleryGrid = document.getElementById("galleryGrid");
    if (!galleryGrid) {
      console.warn("Gallery grid container not found");
      return;
    }

    // Generate image paths (1.png through 39.png)
    const imageCount = 39;
    const imagePaths = Array.from({ length: imageCount }, (_, i) => `assets/gallery/${i + 1}.png`);

    // Shuffle images randomly
    const shuffledImages = shuffleArray(imagePaths);

    // Split into 3 columns evenly (39 / 3 = 13 per column)
    const imagesPerColumn = Math.ceil(shuffledImages.length / 3);
    const columns = [[], [], []];
    shuffledImages.forEach((image, index) => {
      columns[index % 3].push(image);
    });

    // Clear existing content
    galleryGrid.innerHTML = "";

    // Create gallery cards with image stacks
    columns.forEach((images, colIndex) => {
      const card = document.createElement("div");
      card.className = "gallery-card";

      const stack = document.createElement("div");
      stack.className = "gallery-stack";

      images.forEach((imagePath, idx) => {
        const img = document.createElement("img");
        img.src = imagePath;
        img.alt = "MSP 790 artwork";
        img.loading = "lazy";
        img.decoding = "async";
        if (idx === 0) {
          img.classList.add("active");
        }
        stack.appendChild(img);
      });

      card.appendChild(stack);
      galleryGrid.appendChild(card);

      // Start rotation for this stack
      if (images.length > 1) {
        rotateImages(stack, images.length);
      }
    });

    console.log(`Gallery initialized: 3 columns with ${imagePaths.length} images (${Math.floor(imagePaths.length / 3)} per column)`);
  }

  function rotateImages(stack, imageCount) {
    let currentIndex = 0;
    setInterval(() => {
      const images = stack.querySelectorAll("img");
      if (images.length === 0) return;
      images[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % imageCount;
      images[currentIndex].classList.add("active");
    }, 3000);
  }

  function initBackgroundAudioInterruption() {
    const backgroundAudio = (
      document.getElementById("bg-audio") ||
      document.getElementById("bg-music") ||
      document.querySelector('audio source[src$="jong.mp3"]')?.closest("audio")
    );
    if (!backgroundAudio) return;

    const mediaSelector = "video, audio, iframe, .media-wrapper";
    const interactiveKeys = new Set([" ", "Enter", "Spacebar"]);

    const isBackgroundAudioPlaying = () => !backgroundAudio.paused && !backgroundAudio.ended;

    const pauseBackgroundAudio = () => {
      if (isBackgroundAudioPlaying()) {
        backgroundAudio.pause();
      }
    };

    const getMediaInteractionTarget = target => {
      if (!(target instanceof Element)) return null;
      const mediaTarget = target.closest(mediaSelector);
      return mediaTarget === backgroundAudio ? null : mediaTarget;
    };

    const pauseOnMediaInteraction = event => {
      if (getMediaInteractionTarget(event.target)) {
        pauseBackgroundAudio();
      }
    };

    const pauseOnMediaKeyInteraction = event => {
      if (interactiveKeys.has(event.key) && getMediaInteractionTarget(event.target)) {
        pauseBackgroundAudio();
      }
    };

    const pauseOnIframeFocus = () => {
      const activeElement = document.activeElement;
      if (activeElement instanceof HTMLIFrameElement) {
        pauseBackgroundAudio();
      }
    };

    document.addEventListener("pointerdown", pauseOnMediaInteraction, true);
    document.addEventListener("touchstart", pauseOnMediaInteraction, { capture: true, passive: true });
    document.addEventListener("play", pauseOnMediaInteraction, true);
    document.addEventListener("keydown", pauseOnMediaKeyInteraction, true);
    window.addEventListener("blur", pauseOnIframeFocus);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initBackgroundAudioInterruption();
    renderChrome();
    if (document.body.dataset.page === "home") {
      const homeBody = document.body;
      const brandLockup = document.querySelector(".brand-lockup");
      const railToggle = document.querySelector(".rail-tab-toggle");
      const siteHeader = document.getElementById("site-header");
      const scrollHint = document.getElementById("scrollHint");
      const heroShell = document.querySelector(".hero-shell");
      const homeBackdrop = document.querySelector(".home-backdrop");
      const mobileQuery = window.matchMedia("(max-width: 720px)");
      let railMotionTimer;
      let railHideTimer;
      let railLeadTimer;
      let railShownByScroll = false;
      const setRailOpen = (open, leadWithTab = false) => {
        clearTimeout(railLeadTimer);
        clearTimeout(railMotionTimer);
        homeBody.classList.remove("home-rail-opening", "home-rail-closing", "home-rail-tab-leading");
        if (open) {
          if (leadWithTab) {
            homeBody.classList.add("home-rail-tab-leading");
            railLeadTimer = window.setTimeout(() => {
              homeBody.classList.remove("home-rail-hidden", "home-rail-tab-leading");
              homeBody.classList.add("home-rail-open", "home-rail-opening");
              railMotionTimer = window.setTimeout(() => {
                homeBody.classList.remove("home-rail-opening");
              }, 340);
            }, 96);
          } else {
            homeBody.classList.remove("home-rail-hidden");
            homeBody.classList.add("home-rail-open");
          }
        } else {
          homeBody.classList.remove("home-rail-open", "home-rail-opening");
          homeBody.classList.add("home-rail-hidden", "home-rail-closing");
          railMotionTimer = window.setTimeout(() => {
            homeBody.classList.remove("home-rail-closing");
          }, 300);
        }
        const expanded = String(open);
        brandLockup?.setAttribute("aria-expanded", expanded);
        railToggle?.setAttribute("aria-expanded", expanded);
        railToggle?.setAttribute("aria-label", open ? "Close sidebar" : "Open sidebar");
        railToggle?.setAttribute("title", open ? "Close sidebar" : "Open sidebar");
      };
      const syncMobileHomeState = () => {
        if (!mobileQuery.matches) return false;
        clearTimeout(railLeadTimer);
        clearTimeout(railMotionTimer);
        clearTimeout(railHideTimer);
        railShownByScroll = false;
        homeBody.classList.remove(
          "home-rail-open",
          "home-rail-hidden",
          "home-rail-offscreen",
          "home-rail-visible",
          "home-rail-opening",
          "home-rail-closing",
          "home-rail-tab-leading"
        );
        brandLockup?.setAttribute("aria-expanded", "true");
        railToggle?.setAttribute("aria-expanded", "true");
        railToggle?.setAttribute("aria-label", "Close sidebar");
        railToggle?.setAttribute("title", "Close sidebar");
        return true;
      };
      const setRailVisibility = visible => {
        clearTimeout(railHideTimer);
        if (!visible) {
          railShownByScroll = false;
          clearTimeout(railLeadTimer);
          clearTimeout(railMotionTimer);
          homeBody.classList.remove(
            "home-rail-open",
            "home-rail-opening",
            "home-rail-closing",
            "home-rail-tab-leading",
            "home-rail-visible"
          );
          homeBody.classList.add("home-rail-hidden", "home-rail-offscreen");
          brandLockup?.setAttribute("aria-expanded", "false");
          railToggle?.setAttribute("aria-expanded", "false");
          railToggle?.setAttribute("aria-label", "Open sidebar");
          railToggle?.setAttribute("title", "Open sidebar");
          return;
        }
        homeBody.classList.remove("home-rail-offscreen");
        if (!railShownByScroll) {
          homeBody.classList.add("home-rail-hidden");
          homeBody.classList.add("home-rail-visible");
          railShownByScroll = true;
          window.setTimeout(() => {
            homeBody.classList.remove("home-rail-visible");
          }, 940);
        }
      };
      const updateHomeScrollScene = () => {
        if (syncMobileHomeState()) {
          if (window.scrollY > 60) {
            homeBody.classList.remove("home-show-scroll-hint");
            scrollHint?.setAttribute("aria-hidden", "true");
          }
          return;
        }
        const scrollY = window.scrollY;
        const rootStyles = window.getComputedStyle(homeBody);
        const parsedFadeHeight = parseFloat(rootStyles.getPropertyValue("--home-fade-height"));
        const fadeHeight = Number.isFinite(parsedFadeHeight) ? parsedFadeHeight : 0;
        const backdropHeight = homeBackdrop ? homeBackdrop.offsetHeight : 0;
        const fadeStart = backdropHeight > fadeHeight ? backdropHeight - fadeHeight : 0;
        const fallbackThreshold = heroShell ? heroShell.offsetTop : Math.max(180, window.innerHeight * 0.3);
        const railRevealThreshold = Math.max(0, (fadeStart || fallbackThreshold) - 8);
        setRailVisibility(scrollY > railRevealThreshold);
        if (scrollY > 80) {
          homeBody.classList.remove("home-show-scroll-hint");
          scrollHint?.setAttribute("aria-hidden", "true");
        }
      };
      const updateRailState = () => {
        const expanded = String(homeBody.classList.contains("home-rail-open"));
        brandLockup?.setAttribute("aria-expanded", expanded);
        railToggle?.setAttribute("aria-expanded", expanded);
      };
      railToggle?.addEventListener("click", event => {
        if (mobileQuery.matches) return;
        event.preventDefault();
        railShownByScroll = true;
        const willOpen = !homeBody.classList.contains("home-rail-open");
        setRailOpen(willOpen, willOpen);
        updateRailState();
      });
      document.addEventListener("pointerdown", event => {
        if (mobileQuery.matches || !homeBody.classList.contains("home-rail-open")) return;
        if (siteHeader?.contains(event.target)) return;
        setRailOpen(false, false);
        updateRailState();
      });
      document.addEventListener("keydown", event => {
        if (event.key !== "Escape" || mobileQuery.matches || !homeBody.classList.contains("home-rail-open")) return;
        setRailOpen(false, false);
        updateRailState();
      });
      updateHomeScrollScene();
      window.addEventListener("scroll", updateHomeScrollScene, { passive: true });
      window.addEventListener("resize", updateHomeScrollScene);
      mobileQuery.addEventListener("change", updateHomeScrollScene);
      updateRailState();
    }
    document.querySelectorAll(".carousel").forEach(mountCarousel);
    initializeGallery();
  });

  return {
    initFirebase,
    initBackgroundAudioInterruption,
    renderChrome
  };
})();
