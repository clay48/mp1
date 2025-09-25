document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const sections = [
    document.querySelector('#about'),
    document.querySelector('#features'),
    document.querySelector('#pricing'),
    document.querySelector('#gallery'),
    document.querySelector('#contact')
  ];

  // Update navbar size (shrink on scroll)
  function updateNav() {
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  // Update active nav link based on scroll position
  function updateActiveLink() {
    const navHeight = nav.offsetHeight;
    let currentIndex = 0;
    for (let i = 1; i < sections.length; i++) {
      if (window.scrollY >= sections[i].offsetTop - navHeight) {
        currentIndex = i;
      } else {
        break;
      }
    }
    // Highlight last nav item if scrolled to bottom
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 5) {
      currentIndex = sections.length - 1;
    }
    navLinks.forEach(link => link.classList.remove('active'));
    navLinks[currentIndex].classList.add('active');
  }

  window.addEventListener('scroll', () => {
    updateNav();
    updateActiveLink();
  });
  // Initialize the active link on page load
  updateActiveLink();

  // Carousel functionality
  const carouselInner = document.querySelector('.carousel-inner');
  const slides = document.querySelectorAll('.carousel-inner .slide');
  let currentSlide = 0;
  const totalSlides = slides.length;
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  function updateCarousel() {
    carouselInner.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
      updateCarousel();
    });
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % totalSlides;
      updateCarousel();
    });
  }

  // Modal functionality
  const modalButtons = document.querySelectorAll('.modal-btn');
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.modal .close');

  modalButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('show');
      }
    });
  });

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.remove('show');
      }
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  });
});
