// Content data for Virexo Innovations. Keeping this separate from
// script.js makes it easy to edit copy without touching behavior.

const SERVICES = [
  {
    id: "web",
    title: "Web Development",
    icon: "web",
    desc: "Fast, accessible websites and web apps built on clean, maintainable code.",
    features: ["Business websites", "Corporate websites", "SaaS platforms", "Landing pages", "Custom web applications"],
    tech: ["HTML", "React", "Node.js"],
  },
  {
    id: "design",
    title: "UI/UX Design",
    icon: "design",
    desc: "Interfaces designed around how people actually use your product.",
    features: ["User research", "Wireframes", "Prototypes", "Design systems", "Responsive interfaces"],
    tech: ["Figma", "Design Tokens"],
  },
  {
    id: "ai",
    title: "AI & Machine Learning",
    icon: "ai",
    desc: "Intelligent tools that automate work and surface decisions faster.",
    features: ["AI assistants", "AI automation", "Predictive analytics", "Custom AI integrations", "Intelligent business tools"],
    tech: ["Python", "OpenAI API"],
  },
  {
    id: "mobile",
    title: "Mobile App Development",
    icon: "mobile",
    desc: "Native-feeling apps for iOS and Android from a single codebase.",
    features: ["Android", "iOS", "Cross-platform apps", "App UI/UX", "API integrations"],
    tech: ["React Native", "REST APIs"],
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    icon: "ecommerce",
    desc: "Online stores built to convert, from checkout to fulfillment.",
    features: ["Online stores", "Product management", "Payment integrations", "Order systems", "Analytics"],
    tech: ["Stripe", "Shopify", "Node.js"],
  },
  {
    id: "automation",
    title: "Business Automation",
    icon: "automation",
    desc: "Workflow and CRM automation that removes repetitive manual work.",
    features: ["Workflow automation", "CRM automation", "Email automation", "Data processing", "AI-powered workflows"],
    tech: ["Zapier", "Node.js", "Python"],
  },
  {
    id: "cloud",
    title: "Cloud & Backend",
    icon: "cloud",
    desc: "Reliable server architecture that scales with your traffic.",
    features: ["REST APIs", "Authentication", "Databases", "Cloud deployment", "Server architecture"],
    tech: ["Express", "PostgreSQL", "AWS"],
  },
  {
    id: "seo",
    title: "SEO & Growth Marketing",
    icon: "seo",
    desc: "Get found and get chosen with technical SEO and conversion-focused analytics.",
    features: ["Technical & on-page SEO", "Performance optimization", "Analytics", "Conversion optimization"],
    tech: ["Google Analytics", "Search Console"],
  },
];

const PROVIDERS = [
  { id: "maya-khan", name: "Maya Khan", role: "Senior Product Designer", category: "Design", services: ["UI/UX Design", "Design Systems", "Product Strategy"], skills: ["Figma", "Prototyping", "UX Research"], rating: "4.9", reviews: 86, projects: 42, rate: "From $450", availability: "Available this week", location: "Lahore, Pakistan", initials: "MK", bio: "Product designer focused on clean interfaces, conversion journeys and scalable design systems." },
  { id: "hamza-ali", name: "Hamza Ali", role: "Full-Stack Engineer", category: "Web", services: ["Web Development", "Cloud & Backend", "SaaS Platforms"], skills: ["React", "Node.js", "PostgreSQL"], rating: "4.8", reviews: 71, projects: 38, rate: "From $600", availability: "Available in 3 days", location: "Islamabad, Pakistan", initials: "HA", bio: "Full-stack engineer who turns product ideas into fast, maintainable web applications and APIs." },
  { id: "sara-ahmed", name: "Sara Ahmed", role: "AI Automation Specialist", category: "AI", services: ["AI & Machine Learning", "Business Automation", "AI Assistants"], skills: ["Python", "OpenAI API", "Zapier"], rating: "5.0", reviews: 54, projects: 29, rate: "From $750", availability: "2 slots open", location: "Karachi, Pakistan", initials: "SA", bio: "Builds practical AI assistants and workflow automations that remove repetitive work and improve response time." },
  { id: "daniel-ross", name: "Daniel Ross", role: "Growth & SEO Strategist", category: "Growth", services: ["SEO & Growth Marketing", "Analytics", "Conversion Optimization"], skills: ["SEO", "GA4", "CRO"], rating: "4.9", reviews: 63, projects: 51, rate: "From $350", availability: "Available next week", location: "Dubai, UAE", initials: "DR", bio: "Data-led growth specialist helping digital products earn more qualified traffic and convert it into customers." },
  { id: "noor-fatima", name: "Noor Fatima", role: "Mobile App Developer", category: "Web", services: ["Mobile App Development", "API Integrations", "App UI"], skills: ["React Native", "Firebase", "REST APIs"], rating: "4.8", reviews: 47, projects: 31, rate: "From $550", availability: "Available this month", location: "Multan, Pakistan", initials: "NF", bio: "Cross-platform mobile developer creating polished iOS and Android experiences from one codebase." },
  { id: "ahmed-raza", name: "Ahmed Raza", role: "E-Commerce Engineer", category: "Web", services: ["E-Commerce", "Shopify", "Payment Integration"], skills: ["Shopify", "Stripe", "Next.js"], rating: "4.9", reviews: 39, projects: 26, rate: "From $500", availability: "Available this week", location: "Rawalpindi, Pakistan", initials: "AR", bio: "E-commerce specialist building fast storefronts, streamlined checkouts and reliable order flows." },
  { id: "aisha-noor", name: "Aisha Noor", role: "Brand & UI Designer", category: "Design", services: ["UI/UX Design", "Brand Identity", "Landing Pages"], skills: ["Figma", "Branding", "Webflow"], rating: "4.9", reviews: 44, projects: 35, rate: "From $300", availability: "Available in 2 days", location: "Islamabad, Pakistan", initials: "AN", bio: "Brand and interface designer creating memorable visual systems that stay consistent across web touchpoints." },
  { id: "usman-javed", name: "Usman Javed", role: "Automation & Backend Engineer", category: "AI", services: ["Business Automation", "Cloud & Backend", "Data Pipelines"], skills: ["Node.js", "Python", "AWS"], rating: "4.8", reviews: 32, projects: 24, rate: "From $650", availability: "Available next week", location: "Faisalabad, Pakistan", initials: "UJ", bio: "Backend and automation engineer connecting business systems into dependable, scalable workflows." }
];

const SOLUTIONS = [
  { id: "startups", name: "Startups", problem: "Limited runway to prove product-market fit.", solution: "Lean MVP builds that ship in weeks, not quarters.", benefit: "Get in front of investors and users faster." },
  { id: "ecommerce", name: "E-Commerce", problem: "Cart abandonment and slow storefronts.", solution: "High-performance stores with streamlined checkout.", benefit: "Higher conversion rate and average order value." },
  { id: "healthcare", name: "Healthcare", problem: "Outdated patient-facing systems and manual scheduling.", solution: "Secure booking portals and automated intake workflows.", benefit: "Reduced no-shows and admin overhead." },
  { id: "education", name: "Education", problem: "Disconnected learning tools and low engagement.", solution: "Unified learning platforms with progress tracking.", benefit: "Better completion rates and student retention." },
  { id: "realestate", name: "Real Estate", problem: "Listings that don't convert browsers into leads.", solution: "Fast listing sites with integrated lead capture.", benefit: "More qualified inquiries per listing." },
  { id: "finance", name: "Finance", problem: "Manual reporting and compliance overhead.", solution: "Automated dashboards and secure data pipelines.", benefit: "Faster reporting cycles with fewer errors." },
  { id: "services", name: "Professional Services", problem: "Inconsistent client onboarding and follow-up.", solution: "CRM automation tied to your existing workflow.", benefit: "More consistent client experience at scale." },
  { id: "saas", name: "SaaS", problem: "Feature requests outpacing engineering bandwidth.", solution: "A dedicated build team for your roadmap backlog.", benefit: "Ship features without hiring full-time." },
  { id: "small", name: "Small Businesses", problem: "No time or budget for a full agency engagement.", solution: "Scoped, fixed-price builds sized to real budgets.", benefit: "A professional web presence without agency overhead." },
  { id: "enterprise", name: "Enterprises", problem: "Legacy systems slowing down digital initiatives.", solution: "Modern front-ends layered over existing infrastructure.", benefit: "Faster digital transformation with less risk." },
];

const AI_CAPABILITIES = [
  { title: "AI Customer Support", desc: "Deflect common questions instantly, 24/7." },
  { title: "AI Chatbots", desc: "Context-aware assistants trained on your business." },
  { title: "AI Document Processing", desc: "Extract and structure data from unstructured files." },
  { title: "AI Data Analysis", desc: "Turn raw data into decisions your team can act on." },
  { title: "AI Content Assistance", desc: "Drafting and editing support for marketing content." },
  { title: "AI Workflow Automation", desc: "Connect tools so information moves without manual entry." },
  { title: "AI Recommendations", desc: "Personalized suggestions that lift engagement and sales." },
  { title: "AI Knowledge Assistants", desc: "Internal assistants that answer from your own documentation." },
];

const PROJECTS = [
  { title: "Norvanta Marketing Site", category: "Web", desc: "Full rebuild cutting load time by 71% and doubling demo requests.", tech: ["React", "Node.js", "SEO"] },
  { title: "Brightfield Client Portal", category: "Web", desc: "A self-serve client dashboard replacing email-based status updates.", tech: ["React", "PostgreSQL"] },
  { title: "Usonic Support Assistant", category: "AI", desc: "An AI assistant handling tier-1 support tickets around the clock.", tech: ["OpenAI API", "Node.js"] },
  { title: "Parallax Goods Storefront", category: "E-Commerce", desc: "A headless storefront integrated with Stripe and real-time inventory.", tech: ["Next.js", "Stripe"] },
  { title: "Halcyon Data Mobile App", category: "Mobile", desc: "A cross-platform field-reporting app for on-site teams.", tech: ["React Native", "REST API"] },
  { title: "Invoice Automation Suite", category: "Automation", desc: "Automated invoice generation and reminders, saving 12+ hours a week.", tech: ["Node.js", "Cron", "Email API"] },
];

const TECH_STACK = [
  "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "Python",
  "AI/ML", "MongoDB", "PostgreSQL", "SQLite", "Cloud", "Git", "GitHub",
];

const SERVICE_ICONS = {
  web: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><rect x="5" y="9" width="30" height="20" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M5 15h30" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="13" cy="12" r="1" fill="currentColor"/></svg>',
  design: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><rect x="6" y="6" width="28" height="28" rx="4" stroke="currentColor" stroke-width="1.8"/><circle cx="15" cy="16" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M11 27c1.2-3.4 3.8-5 7-5s5.8 1.6 7 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  ai: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="1.8"/><path d="M20 6v28M6 20h28" stroke="currentColor" stroke-width="1.4"/></svg>',
  mobile: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><rect x="12" y="4" width="16" height="32" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M17 32h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  ecommerce: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><path d="M8 12h24l-2.5 16h-19L8 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 12V9a6 6 0 0 1 12 0v3" stroke="currentColor" stroke-width="1.8"/></svg>',
  automation: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><circle cx="14" cy="14" r="5" stroke="currentColor" stroke-width="1.8"/><circle cx="27" cy="27" r="5" stroke="currentColor" stroke-width="1.8"/><path d="M18 17l6 6" stroke="currentColor" stroke-width="1.8"/></svg>',
  cloud: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><path d="M11 27a6 6 0 0 1 .5-12 8 8 0 0 1 15.4-2A6.5 6.5 0 0 1 29 27H11Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  seo: '<svg viewBox="0 0 40 40" width="26" height="26" fill="none"><circle cx="17" cy="17" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M24 24l7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

window.PROVIDERS = PROVIDERS;
window.SERVICES = SERVICES;
