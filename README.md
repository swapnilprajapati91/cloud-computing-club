# Cloud Computing Club Website

A modern, dynamic website for the Cloud Computing Club at Rama University, built with Tailwind CSS and pure JavaScript.

## Features
- **Modern Glassmorphism Design**: Premium UI with frosted glass effects and responsive layouts.
- **Interactive Animations**: Smooth scrolling, floating card animations, hover effects, and seamless page transitions.
- **Multi-page Architecture**: Dedicated pages for Events, Team, Contact, and special events like Cloud Carnival.
- **Component Consistency**: Centralized JavaScript logic for mobile menus and form validation.
- **Tailwind Configured**: Custom Tailwind theme extensions for unified branding.
- **Responsive Layout**: Seamless experience across desktop, tablet, and mobile devices.

## Tech Stack
- **HTML5**: Semantic structure.
- **Tailwind CSS**: Utility-first CSS framework (loaded via CDN).
- **Vanilla JavaScript**: DOM manipulation, interactive menus, and form handling.
- **Font Awesome**: Icon library.

## Usage
1. **Clone or download** the repository.
2. Open `index.html` in your web browser.
3. Navigate through the sections and inner pages using the responsive navbar.
4. Explore the `pages/` directory for detailed sections like Events and Team.

## Project Structure
```text
cloud-computing/
├── index.html                     # Main Landing Page
├── pages/                         # Inner Pages
│   ├── events.html                # Events listing
│   ├── cloud-carnival.html        # Cloud Carnival special event page
│   ├── team.html                  # Team profiles
│   ├── contact.html               # Contact form & info
│   ├── benefits.html              # About Us & Club Benefits
│   └── system-architecture.html   # System Architecture page
├── css/                           # Extracted Stylesheets
│   ├── index.css                  # Landing page styles
│   ├── events.css                 # Events page styles
│   ├── team.css                   # Team page styles
│   ├── cloud-carnival.css         # Cloud Carnival styles
│   ├── contact.css                # Contact page styles
│   ├── style.css                  # Global/Additional styles
│   └── system-architecture.css    # System Architecture styles
├── js/                            # JavaScript
│   ├── script.js                  # Shared logic (Mobile menu, form validation)
│   ├── tailwind-config.js         # Tailwind custom theme configuration
│   ├── index.js                   # Landing page logic
│   └── system-architecture.js     # System Architecture logic
└── assets/                        # Images and brand assets (e.g., logo)
```

## Development
No build tools are required. The site runs directly in the browser using the Tailwind CSS CDN. Custom CSS is cleanly separated into individual stylesheets per page for optimal maintainability.