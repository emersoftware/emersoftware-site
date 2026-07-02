import type { SupportedLocale } from './config';

export type ExperienceItem = {
  company: string;
  role: string;
  date: string;
  product: string;
  description: string;
  link?: string;
  techs: string[];
};

export type ProjectItem = {
  title: string;
  summary: string;
  description: string;
  image?: string;
  imageSize?: 'sm' | 'md';
  link?: string;
  repo?: string;
  demo?: string;
  techs: string[];
};

export type Dictionary = {
  metaTitle: string;
  metaDescription: string;
  navbar: {
    home: string;
    experience: string;
    projects: string;
    blog: string;
    contact: string;
    langShort: string;
  };
  hero: {
    brand: string;
    name: string;
    role: string;
    about: string;
    email: string;
  };
  githubCommit: {
    error: string;
    timeAgo: {
      justNow: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
      weeksAgo: string;
      monthsAgo: string;
    };
  };
  sections: {
    experience: string;
    projects: string;
    contact: string;
  };
  sectionHeadings: {
    experience: string;
    projects: string;
    blog: string;
  };
  sectionIds: {
    home: string;
    experience: string;
    projects: string;
    contact: string;
  };
  experienceLabels: {
    role: string;
    stack: string;
  };
  list: {
    view: string;
    read: string;
    github: string;
    demo: string;
  };
  contact: {
    success: string;
    error: string;
    form: {
      sendMeAMessage: string;
      emailLabel: string;
      emailPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      submit: string;
    };
  };
  experienceItems: ExperienceItem[];
  projectItems: ProjectItem[];
};

const es: Dictionary = {
  metaTitle: 'Emersoftware - Emerson Salazar Rubilar',
  metaDescription:
    'Emerson Salazar Rubilar (emersoftware) Ingeniero de Software con foco en inteligencia artificial de Concepción, Chile. Trabajemos juntos en tu próximo proyecto.',
  navbar: {
    home: 'Inicio',
    experience: 'Experiencia',
    projects: 'Proyectos',
    blog: 'Blog',
    contact: 'Contacto',
    langShort: 'ES',
  },
  hero: {
    brand: 'emersoftware',
    name: 'Emerson Salazar Rubilar',
    role: 'Ingeniero de Software',
    about: 'Construyo software. Atención al detalle y sentido de urgencia.',
    email: 'hola@emersoftware.cl',
  },
  githubCommit: {
    error: 'No se pudo cargar',
    timeAgo: {
      justNow: 'justo ahora',
      minutesAgo: 'hace {n} min',
      hoursAgo: 'hace {n}h',
      daysAgo: 'hace {n} días',
      weeksAgo: 'hace {n} sem',
      monthsAgo: 'hace {n} meses',
    },
  },
  sections: {
    experience: 'Experiencia',
    projects: 'Proyectos',
    contact: 'Contacto',
  },
  sectionHeadings: {
    experience: 'Dónde he trabajado',
    projects: 'Por amor al arte',
    blog: 'Cosas que escribo',
  },
  sectionIds: {
    home: 'inicio',
    experience: 'experiencia',
    projects: 'proyectos',
    contact: 'contacto',
  },
  experienceLabels: {
    role: 'Cargo',
    stack: 'Stack',
  },
  list: {
    view: 'ir al sitio',
    read: 'leer',
    github: 'github',
    demo: 'demo',
  },
  contact: {
    success: 'Gracias por tu mensaje! <br /> Te responderé lo antes posible.',
    error:
      'Hubo un error al enviar tu mensaje, por favor intenta de nuevo o contactame por otro medio',
    form: {
      sendMeAMessage: '¿Seamos amigos? ¿Trabajemos juntos?',
      emailLabel: 'Email',
      emailPlaceholder: 'Ingresa tu email',
      messageLabel: 'Mensaje',
      messagePlaceholder: 'Escribe tu mensaje...',
      submit: 'Enviar',
    },
  },
  experienceItems: [
    {
      company: 'Revi (CChC)',
      role: 'Software Engineer',
      date: 'ene. 2026 - actualidad',
      link: 'https://ia-revi.cl',
      product: 'Revisión de permisos con IA',
      description:
        'Desarrollo en una plataforma basada en IA para la revisión automatizada de permisos de edificación. Implementación de flujos de análisis inteligente para validación normativa.',
      techs: ['React', 'Python', 'TypeScript', 'AI'],
    },
    {
      company: 'Xerply',
      role: 'Software Engineer',
      date: 'nov. 2024 - dic. 2025',
      link: 'https://www.linkedin.com/company/xerply',
      product: 'ERP con inteligencia artificial',
      description:
        'Integración con el SAT (México) mediante terceros para facturación y firma de nóminas, actualización de la API de agentes de IA y diseño de mecanismos de seguridad y aislamiento para entornos multi-tenant. Participación en la evolución de la arquitectura del sistema, con foco en escalabilidad, confiabilidad y orquestación de agentes inteligentes.',
      techs: ['LangGraph', 'LangChain', 'React', 'Flask', 'Python', 'TypeScript'],
    },
    {
      company: 'Hoktus',
      role: 'Software Engineer',
      date: 'ago. 2025 - nov. 2025',
      link: 'https://hoktus.com',
      product: 'Agente de reclutamiento',
      description:
        'Diseño y desarrollo de un sistema para configurar agentes de IA personalizados vía WhatsApp, orientados a procesos de reclutamiento y onboarding. Automatización de interacción con candidatos para cargos de alta rotación, reduciendo carga operativa y tiempos de selección.',
      techs: ['LangGraph', 'AI Agents', 'React', 'TypeScript', 'Python'],
    },
    {
      company: 'Blar AI',
      role: 'Software Engineer',
      date: 'oct. 2024 - jul. 2025',
      link: 'https://blar.io',
      product: 'Agente de code review',
      description:
        'Desarrollo de agentes de revisión automática de código integrados al flujo de pull requests. Implementación de análisis de patrones de diseño, detección de bugs, vulnerabilidades de seguridad y problemas de performance mediante técnicas de exploración contextual del código. Contribución a la mejora de la calidad del software y la velocidad de revisión en equipos de desarrollo.',
      techs: ['LangGraph', 'Python', 'RAG', 'React', 'TypeScript'],
    },
    {
      company: 'UpWorth',
      role: 'Backend Engineer',
      date: 'may. 2024 - oct. 2024',
      link: 'https://upworth.com.au',
      product: 'Chatbot de finanzas personales (Australia)',
      description:
        'Desarrollo del MVP de un chatbot conversacional de finanzas personales. Diseño de la arquitectura del agente y la integración con APIs financieras para análisis de gastos, ahorro y comportamiento financiero del usuario, así como la categorización de las transacciones. Participación en decisiones clave de diseño para asegurar escalabilidad y claridad en la interpretación de datos financieros.',
      techs: ['LangGraph', 'Vertex AI', 'Python', 'LangChain', 'Next.js'],
    },
  ],
  projectItems: [
    {
      title: 'The Stack',
      summary: 'Un rincón para descubrir la tecnología que se crea en Latinoamérica.',
      description:
        'Un índice de contenido tecnológico hecho en Latinoamérica. Reúne proyectos independientes, blogs, noticias del ecosistema, reflexiones técnicas y meetups en un espacio dedicado al contenido humano, original y de calidad. Save the internet.',
      image: '/thestack-mini.jpeg',
      link: 'https://thestack.cl',
      repo: 'https://github.com/emersoftware/thestack',
      techs: [],
    },
    {
      title: 'Themis',
      summary: 'IA que encuentra señales de riesgo en licitaciones públicas.',
      description:
        'Una plataforma de auditoría automatizada que analiza licitaciones de Mercado Público para detectar incumplimientos normativos, patrones sospechosos e irregularidades. Ganó el primer lugar del track Legacy en Platanus Hack 25.',
      image: '/themis-mini.jpeg',
      imageSize: 'md',
      link: 'https://themis.lat',
      repo: 'https://github.com/v4rgas/themis.lat',
      techs: [],
    },
    {
      title: 'Kapin',
      summary: 'Un agente que convierte repositorios en métricas de producto accionables.',
      description:
        'Un agente que examina repositorios de software, identifica métricas de producto relevantes y genera las consultas y la estructura técnica necesarias para medirlas y persistirlas. Su objetivo es reducir la distancia entre construir un producto y entender cómo se usa.',
      image: '/kapin-mini.jpeg',
      imageSize: 'md',
      repo: 'https://github.com/emersoftware/kapin',
      demo: 'https://www.linkedin.com/posts/emerson-salazar-rubilar_aprovechando-que-hoy-comienza-la-platanus-activity-7397683971565821952-emdq',
      techs: [],
    },
  ],
};

const en: Dictionary = {
  metaTitle: 'Emersoftware - Emerson Salazar Rubilar',
  metaDescription:
    "Emerson Salazar Rubilar (emersoftware) Software Engineer with a focus on artificial intelligence from Concepción, Chile. Let's work together on your next project.",
  navbar: {
    home: 'Home',
    experience: 'Experience',
    projects: 'Projects',
    blog: 'Blog',
    contact: 'Contact',
    langShort: 'EN',
  },
  hero: {
    brand: 'emersoftware',
    name: 'Emerson Salazar Rubilar',
    role: 'Software Engineer',
    about:
      'I build software products focused on artificial intelligence. Available for consulting on development and AI agents.',
    email: 'hola@emersoftware.cl',
  },
  githubCommit: {
    error: 'Failed to load',
    timeAgo: {
      justNow: 'just now',
      minutesAgo: '{n} min ago',
      hoursAgo: '{n}h ago',
      daysAgo: '{n} days ago',
      weeksAgo: '{n} weeks ago',
      monthsAgo: '{n} months ago',
    },
  },
  sections: {
    experience: 'Experience',
    projects: 'Projects',
    contact: 'Contact',
  },
  sectionHeadings: {
    experience: "Where I've worked",
    projects: 'For the love of it',
    blog: 'Things I write',
  },
  sectionIds: {
    home: 'home',
    experience: 'experience',
    projects: 'projects',
    contact: 'contact',
  },
  experienceLabels: {
    role: 'Role',
    stack: 'Stack',
  },
  list: {
    view: 'view',
    read: 'read',
    github: 'github',
    demo: 'demo',
  },
  contact: {
    success: 'Thanks for your message! <br /> I will reply as soon as possible.',
    error:
      'There was an error sending your message, please try again or contact me through another channel',
    form: {
      sendMeAMessage: "Let's be friends? Work together?",
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      messageLabel: 'Message',
      messagePlaceholder: 'Write your message...',
      submit: 'Send',
    },
  },
  experienceItems: [
    {
      company: 'Revi (CChC)',
      role: 'Software Engineer',
      date: 'Jan. 2026 - present',
      link: 'https://ia-revi.cl',
      product: 'AI-Powered Permit Review',
      description:
        'Development on an AI-based platform for automated building permit review. Implementation of intelligent analysis workflows for regulatory validation.',
      techs: ['React', 'Python', 'TypeScript', 'AI'],
    },
    {
      company: 'Xerply',
      role: 'Software Engineer',
      date: 'Nov. 2024 - Dec. 2025',
      link: 'https://www.linkedin.com/company/xerply',
      product: 'AI-powered ERP',
      description:
        'Integration with SAT (Mexico) through third parties for invoicing and payroll signing, updating the AI agents API and designing security and isolation mechanisms for multi-tenant environments. Participation in the evolution of system architecture, focusing on scalability, reliability, and intelligent agent orchestration.',
      techs: ['LangGraph', 'LangChain', 'React', 'Flask', 'Python', 'TypeScript'],
    },
    {
      company: 'Hoktus',
      role: 'Software Engineer',
      date: 'Aug. 2025 - Nov. 2025',
      link: 'https://hoktus.com',
      product: 'Recruitment agent',
      description:
        'Design and development of a system to configure custom AI agents via WhatsApp, focused on recruitment and onboarding processes. Automation of candidate interaction for high-turnover positions, reducing operational load and selection times.',
      techs: ['LangGraph', 'AI Agents', 'React', 'TypeScript', 'Python'],
    },
    {
      company: 'Blar AI',
      role: 'Software Engineer',
      date: 'Oct. 2024 - Jul. 2025',
      link: 'https://blar.io',
      product: 'Code review agent',
      description:
        'Development of automated code review agents integrated into the pull request workflow. Implementation of design pattern analysis, bug detection, security vulnerabilities, and performance issues through contextual code exploration techniques. Contribution to improving software quality and review speed in development teams.',
      techs: ['LangGraph', 'Python', 'RAG', 'React', 'TypeScript'],
    },
    {
      company: 'UpWorth',
      role: 'Backend Engineer',
      date: 'May 2024 - Oct. 2024',
      link: 'https://upworth.com.au',
      product: 'Personal finance chatbot (Australia)',
      description:
        'Development of an MVP personal finance conversational chatbot. Design of agent architecture and integration with financial APIs for expense analysis, savings, and user financial behavior, as well as transaction categorization. Participation in key design decisions to ensure scalability and clarity in financial data interpretation.',
      techs: ['LangGraph', 'Vertex AI', 'Python', 'LangChain', 'Next.js'],
    },
  ],
  projectItems: [
    {
      title: 'The Stack',
      summary: 'A place to discover the technology being built in Latin America.',
      description:
        'A technology content index made in Latin America. It brings independent projects, blogs, ecosystem news, technical reflections, and meetups into one place dedicated to original, human-made, high-quality content. Save the internet.',
      image: '/thestack-mini.jpeg',
      link: 'https://thestack.cl',
      repo: 'https://github.com/emersoftware/thestack',
      techs: [],
    },
    {
      title: 'Themis',
      summary: 'AI that uncovers risk signals in public tenders.',
      description:
        'An automated auditing platform that analyzes Mercado Público tenders to detect regulatory violations, suspicious patterns, and irregularities. It won first place in the Legacy track at Platanus Hack 25.',
      image: '/themis-mini.jpeg',
      imageSize: 'md',
      link: 'https://themis.lat',
      repo: 'https://github.com/v4rgas/themis.lat',
      techs: [],
    },
    {
      title: 'Kapin',
      summary: 'An agent that turns repositories into actionable product metrics.',
      description:
        'An agent that examines software repositories, identifies relevant product metrics, and generates the queries and technical structure needed to measure and persist them. Its goal is to close the gap between building a product and understanding how it is used.',
      image: '/kapin-mini.jpeg',
      imageSize: 'md',
      repo: 'https://github.com/emersoftware/kapin',
      demo: 'https://www.linkedin.com/posts/emerson-salazar-rubilar_aprovechando-que-hoy-comienza-la-platanus-activity-7397683971565821952-emdq',
      techs: [],
    },
  ],
};

export function getDictionary(lang: SupportedLocale): Dictionary {
  return lang === 'en' ? en : es;
}
