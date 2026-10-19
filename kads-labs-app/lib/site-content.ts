// NEXORA — site content.
//
// Copy carried over from the original site template
// (kads-lads-website/scripts/content.py, the TESSERACT Website Content Master
// Document) and rebranded to NEXORA: {brand} placeholders resolved, the
// previous studio's personal details (founder name, email, socials) removed.
// Portfolio data lives in ./work-data.ts.

export const site = {
  name: "NEXORA",

  contact: {
    // The studio's WhatsApp number: +91 86046 83669.
    whatsapp: "918604683669",
    whatsappDisplay: "+91 86046 83669",
  },

  startProject: {
    title: "Start a Project",
    sub: "Tell us what you need — your brief opens straight into our WhatsApp.",
    needsLabel: "What do you need?",
    needs: [
      "Website",
      "E-commerce",
      "Branding",
      "Interactive & 3D",
      "Product / SaaS",
      "AI & Automation",
      "Digital Strategy",
      "Something else",
    ],
    nameLabel: "Your name",
    namePlaceholder: "What should we call you?",
    businessLabel: "Business / brand",
    businessPlaceholder: "Optional",
    budgetLabel: "Estimated budget",
    budget: [
      "Under ₹25,000",
      "₹25,000 – ₹75,000",
      "₹75,000 – ₹2,00,000",
      "₹2,00,000+",
      "Not sure yet",
    ],
    detailsLabel: "Tell us a little about your idea",
    detailsPlaceholder: "What are you building? Who is it for? Any deadline?",
    submit: "Continue on WhatsApp",
    hint: "Opens WhatsApp with your brief pre-filled — nothing is sent until you press send.",
    needHint: "Pick at least one and add your name to continue.",
  },

  hero: {
    kicker: "Website design & development studio",
    title: "We don't build ordinary websites.",
    lead: "We create interactive, thoughtful and tailor-made digital experiences for businesses that want to be different.",
    body: "From the first idea to the final interaction, we design and build your digital presence around your business, your audience and your vision.",
    ctaPrimary: "Start a Project",
    ctaSecondary: "Explore Our Work",
  },

  idea: {
    label: "The Idea",
    title: ["Your business is unique.", "Your website should be too."],
    lines: [
      "You don’t need another template.",
      "You don’t need a website that looks like everyone else’s.",
      "You need something that feels like you.",
      "That’s what we build.",
    ],
    body: "We combine strategy, design, technology, interaction and storytelling to create websites and digital experiences made specifically for your brand.",
    disciplines: [
      "Strategy and design",
      "UX design",
      "UI design",
      "Technology and storytelling",
    ],
  },

  services: {
    label: "What We Create",
    title: "Digital experiences built around your business.",
    intro: [
      "We don't believe in fixed packages.",
      "Every business has different goals, audiences and challenges.",
      "So we build what makes sense for you.",
    ],
    items: [
      {
        n: "01",
        name: "Website Design",
        title: "Make a great first impression.",
        body: "We design websites that look beautiful, feel intuitive and communicate your business clearly.",
        tags: ["UX Strategy", "User Journeys", "Wireframes", "UI Design", "Responsive Design", "Prototyping", "Design Systems", "Interaction Design"],
      },
      {
        n: "02",
        name: "Website Development",
        title: "From design to reality.",
        body: "We turn the design into a real, responsive and functional website.",
        tags: ["Business Websites", "Corporate Websites", "Landing Pages", "CMS Websites", "Interactive Websites", "Web Applications"],
      },
      {
        n: "03",
        name: "E-commerce",
        title: "Make buying feel simple.",
        body: "From discovering a product to completing a purchase, we design every step of the experience.",
        tags: ["Product Pages", "Shopping Experiences", "Cart & Checkout", "Payment Integration", "Order Management", "CMS", "Mobile Experiences"],
      },
      {
        n: "04",
        name: "Interactive & 3D",
        title: "Don't just show people. Let them experience it.",
        body: "We create digital experiences using motion, interaction and 3D. Every interaction has a purpose.",
        tags: ["Scroll animations", "Interactive storytelling", "Product interactions", "Micro-interactions", "Cinematic experiences", "3D environments"],
      },
      {
        n: "05",
        name: "Brand & Digital Identity",
        title: "Your brand should feel consistent everywhere.",
        body: "",
        tags: ["Typography", "Colour Systems", "Visual Direction", "Digital Identity", "Design Systems", "Brand Guidelines"],
      },
      {
        n: "06",
        name: "Product & SaaS",
        title: "Digital products people actually want to use.",
        body: "",
        tags: ["Dashboards", "SaaS Platforms", "Web Applications", "Mobile Interfaces", "User Flows", "Prototypes", "Design Systems"],
      },
      {
        n: "07",
        name: "AI & Automation",
        title: "Make your business work smarter.",
        body: "",
        tags: ["AI Experiences", "Workflow Automation", "AI Interfaces", "Internal Tools", "Intelligent Dashboards", "API Integrations"],
      },
      {
        n: "08",
        name: "Digital Strategy",
        title: "Before we build, we think.",
        body: "",
        tags: ["Digital Positioning", "Website Strategy", "User Research", "Competitor Analysis", "Content Structure", "Conversion Strategy"],
      },
    ],
    ctaTitle: "Not sure what you need?",
    ctaLines: [
      "That's completely fine.",
      "Tell us what you're trying to achieve.",
      "We'll help you figure out what needs to be built.",
    ],
  },

  approach: {
    label: "How We Work",
    title: "How an idea becomes an experience.",
    periodLabel: "Understand → Evolve",
    // The 9 steps of the template's Our Approach page, in order.
    steps: [
      { n: "01", name: "Understand", content: "First, we listen. Before we design anything, we learn about your business." },
      { n: "02", name: "Define", content: "Then, we find the direction. We turn everything we've learned into a clear plan — a project blueprint." },
      { n: "03", name: "Explore", content: "Now we start thinking differently. We explore ideas, layouts, references and visual directions." },
      { n: "04", name: "Design", content: "The idea starts to take shape. Typography, colours, layouts, components, images, interactions." },
      { n: "05", name: "Refine", content: "Details make the difference. We review every important detail until everything feels right." },
      { n: "06", name: "Build", content: "Design meets technology. We bring the experience to life, responsive across devices." },
      { n: "07", name: "Test", content: "Before people use it, we test it — devices, navigation, forms, performance, content." },
      { n: "08", name: "Launch", content: "Ready for the world. Once everything is tested and approved, your idea becomes a real digital experience." },
      { n: "09", name: "Evolve", content: "Launch is not the end. Businesses change, and your website should be able to change with them." },
    ],
  },

  work: {
    label: "The Work",
    title: ["We could tell you we're different.", "But we'd rather show you."],
    intro: "Explore a selection of work created for businesses, brands and digital products.",
    clientGroupTitle: "Client Work",
    conceptGroupTitle: "Concepts & Interactive",
  },

  believe: {
    label: "What We Believe",
    title: "Simple for people. Powerful for business.",
    body: [
      "A website should not make people think too hard. It should be easy to understand, easy to explore and easy to remember.",
      "Behind every beautiful experience, there should be a clear purpose.",
      "We make complex things feel simple.",
    ],
  },

  numbers: {
    label: "Our Numbers",
    items: [
      { value: "20K+", label: "Community" },
      { value: "2M+", label: "Reach" },
      { value: "Millions", label: "Views Generated" },
      { value: "Global", label: "Clients & Projects" },
    ],
    body: "What started with an idea has grown into a community, a portfolio and a growing network of people who believe that digital experiences can be better.",
  },

  agency: {
    label: "A Different Kind of Agency",
    title: "We don't want to look like every other agency.",
    kicker: "Because we're not trying to be one.",
    body: "We work closely with our clients, understand what they're trying to achieve and build around that.",
    nots: ["No unnecessary layers.", "No confusing language.", "No copy-paste solutions."],
    closing: "Just good thinking, good design and technology that serves a purpose.",
  },

  faq: {
    label: "FAQ",
    items: [
      {
        q: "Do I need a perfect brief before we talk?",
        a: "No. You don't need a perfect brief. You don't need technical knowledge. You don't even need to know exactly what you want yet. Tell us what you have in mind — we'll take it from there.",
      },
      {
        q: "Do you offer fixed packages?",
        a: "We don't believe in fixed packages. Every business has different goals, audiences and challenges, so we build what makes sense for you.",
      },
      {
        q: "What can you build for us?",
        a: "Website design, website development, e-commerce, interactive & 3D experiences, brand & digital identity, product & SaaS, AI & automation and digital strategy.",
      },
      {
        q: "Will my website look like a template?",
        a: "No. You don't need another template. Every project starts from zero, built around your business, your audience and your vision.",
      },
      {
        q: "How does a project work?",
        a: "Understand, define, explore, design, refine, build, test, launch and evolve. We take the time to understand, explore, design, build and refine.",
      },
      {
        q: "What happens after launch?",
        a: "Launch is not the end. Businesses change, and your website should be able to change with them. We can continue supporting, improving and evolving your digital experience as your business grows.",
      },
      {
        q: "How involved will we be?",
        a: "We communicate, share progress, ask questions, listen to feedback and build together — because the best results happen when the client isn't just watching the process. They're part of it.",
      },
    ],
  },

  stories: {
    label: "Client Stories",
    title: "In our clients' words.",
    sampleTag: "Sample stories",
    avatars: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=faces",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=faces",
    ],
    // SAMPLE quotes carried over from the template (its placeholder reviews,
    // rebranded). Replace with real client feedback before launch.
    items: [
      {
        project: "Aivinci Creative Studio",
        industry: "AI creative & technology studio",
        rating: 5.0,
        quote:
          "We make films, so we're fussy about pace and atmosphere. The team understood that straight away and gave us a site that feels cinematic, from the dark services intro to the AI video showcase. They took every round of feedback seriously.",
      },
      {
        project: "Geetha Jewellers",
        industry: "Jewellery",
        rating: 4.9,
        quote:
          "A jewellery shop is built on trust and warmth, and our website feels the same. The glass domes and that marble-and-gold showroom look stunning, even on a phone. The team explained every step patiently and kept our store details and savings schemes easy to find.",
      },
      {
        project: "Derlin Haus",
        industry: "Menswear e-commerce",
        rating: 4.8,
        quote:
          "Menswear online can look very samey, so we asked NEXORA for a shop with an editorial feel. The zipper hero, the shirt carousel and the calm product pages carry that mood, and the bag, sizes and coupons simply work. Honest advice throughout.",
      },
      {
        project: "AeroSkys",
        industry: "Travel booking",
        rating: 4.7,
        quote:
          "Simple to say, hard to build: flights, hotels, holiday packages, buses and offers, all in one place. The team turned that into a clear search and a step-by-step booking flow, and always answered our questions quickly.",
      },
      {
        project: "SIAARA By S&A",
        industry: "Handcrafted sarees",
        rating: 5.0,
        quote:
          "Every saree we sell is handcrafted, and the site honours that. Browsing by weave or by colour comes naturally, the Telugu option feels like home, and the silk intro is pure joy. The team was lovely to work with, start to finish.",
      },
      {
        project: "Hidden Stories",
        industry: "Short-stay homes, Hyderabad",
        rating: 4.8,
        quote:
          "The brief was to let guests feel Hyderabad before they choose a home. The home-tour film, the Pearl City chapter and the little Hyderabadi phrases set that mood beautifully, while booking stays clear. The team listened closely and never rushed us.",
      },
    ],
  },

  cta: {
    label: "Final CTA",
    title: "Have an idea?",
    lines: ["You don't need a perfect brief.", "You don't need to know exactly what you need."],
    lines2: ["Just bring us the idea.", "We'll figure out the rest together."],
    cta: "Start a Project",
  },

  footer: {
    line: "Digital experiences, built around you.",
    services: ["Web Design", "Development", "E-commerce", "Interactive", "Branding", "Product", "AI"],
    motto: "BUILT DIFFERENT. BUILT FOR YOU.",
    copyright: "© 2026 NEXORA. All rights reserved.",
  },
} as const;
