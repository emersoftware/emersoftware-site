import type { SupportedLocale } from './config';

export type ExperienceItem = {
  company: string;
  role: string;
  date: string;
  product: string;
  description: string;
  techs: string[];
};

export type ProjectItem = {
  title: string;
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
  contact: {
    success: string;
    error: string;
    form: {
      sendMeAMessage: string;
      firstnameLabel: string;
      firstnamePlaceholder: string;
      lastnameLabel: string;
      lastnamePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      messageLabel: string;
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
    contact: 'Contacto',
    langShort: 'ES',
  },
  hero: {
    brand: 'emersoftware',
    name: 'Emerson Salazar Rubilar',
    role: 'Ingeniero de Software',
    about:
      'Construyo productos de software con foco en inteligencia artificial. Disponible para consultoría en desarrollo y agentes de IA.',
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
  contact: {
    success: 'Gracias por tu mensaje! <br /> Te responderé lo antes posible.',
    error:
      'Hubo un error al enviar tu mensaje, por favor intenta de nuevo o contactame por otro medio',
    form: {
      sendMeAMessage: '¿Seamos amigos? ¿Trabajemos juntos?',
      firstnameLabel: 'Nombre',
      firstnamePlaceholder: 'Ingresa tu nombre',
      lastnameLabel: 'Apellido',
      lastnamePlaceholder: 'Ingresa tu apellido',
      emailLabel: 'Email',
      emailPlaceholder: 'Ingresa tu email',
      messageLabel: 'Mensaje',
      submit: 'Enviar',
    },
  },
  experienceItems: [
    {
      company: 'Cámara Chilena de la Construcción (CChC)',
      role: 'Software Engineer',
      date: 'ene. 2026 - actualidad',
      product: 'Revi – Revisión de Permisos con IA',
      description:
        'Desarrollo en una plataforma basada en IA para la revisión automatizada de permisos de edificación. Implementación de flujos de análisis inteligente para validación normativa.',
      techs: ['React', 'Python', 'TypeScript', 'AI'],
    },
    {
      company: 'Xerply',
      role: 'Software Engineer',
      date: 'nov. 2024 - dic. 2025',
      product: 'ERP con inteligencia artificial',
      description:
        'Integración con el SAT (México) mediante terceros para facturación y firma de nóminas, actualización de la API de agentes de IA y diseño de mecanismos de seguridad y aislamiento para entornos multi-tenant. Participación en la evolución de la arquitectura del sistema, con foco en escalabilidad, confiabilidad y orquestación de agentes inteligentes.',
      techs: ['LangGraph', 'LangChain', 'React', 'Flask', 'Python', 'TypeScript'],
    },
    {
      company: 'Hoktus',
      role: 'Software Engineer',
      date: 'ago. 2025 - nov. 2025',
      product: 'Agente de reclutamiento',
      description:
        'Diseño y desarrollo de un sistema para configurar agentes de IA personalizados vía WhatsApp, orientados a procesos de reclutamiento y onboarding. Automatización de interacción con candidatos para cargos de alta rotación, reduciendo carga operativa y tiempos de selección.',
      techs: ['LangGraph', 'AI Agents', 'React', 'TypeScript', 'Python'],
    },
    {
      company: 'Blar AI',
      role: 'Software Engineer',
      date: 'oct. 2024 - jul. 2025',
      product: 'Agente de code review',
      description:
        'Desarrollo de agentes de revisión automática de código integrados al flujo de pull requests. Implementación de análisis de patrones de diseño, detección de bugs, vulnerabilidades de seguridad y problemas de performance mediante técnicas de exploración contextual del código. Contribución a la mejora de la calidad del software y la velocidad de revisión en equipos de desarrollo.',
      techs: ['LangGraph', 'Python', 'RAG', 'React', 'TypeScript'],
    },
    {
      company: 'Pirrol LLC',
      role: 'Backend Engineer',
      date: 'may. 2024 - oct. 2024',
      product: 'Chatbot financiero (UpWorth – Australia)',
      description:
        'Desarrollo del MVP de un chatbot conversacional de finanzas personales. Diseño de la arquitectura del agente y la integración con APIs financieras para análisis de gastos, ahorro y comportamiento financiero del usuario, así como la categorización de las transacciones. Participación en decisiones clave de diseño para asegurar escalabilidad y claridad en la interpretación de datos financieros.',
      techs: ['LangGraph', 'Vertex AI', 'Python', 'LangChain', 'Next.js'],
    },
  ],
  projectItems: [
    {
      title: 'The Stack',
      description:
        'Hacker News orientado a Latinoamérica. Un índice de contenido tech para centralizar contenido humano, original y de calidad: side projects, blogs, noticias del ecosistema, reflexiones técnicas y meetups. Save the internet.',
      image: '/thestack-mini.jpeg',
      link: 'https://thestack.cl',
      repo: 'https://github.com/emersoftware/thestack',
      techs: [],
    },
    {
      title: 'Themis',
      description:
        'Auditoría automatizada de licitaciones públicas con IA. Analiza licitaciones de Mercado Público para detectar incumplimientos normativos, patrones sospechosos y irregularidades. Primer lugar en el track Legacy de Platanus Hack 25.',
      image: '/themis-mini.jpeg',
      imageSize: 'md',
      link: 'https://themis.lat',
      repo: 'https://github.com/v4rgas/themis.lat',
      techs: [],
    },
    {
      title: 'Kapin',
      description:
        'Agente de auditoría de métricas de producto para repositorios de software. Analiza repositorios y entrega métricas relevantes, consultas para medirlas y la base técnica para persistir los datos. Reduce la fricción entre desarrollo y medición.',
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
  contact: {
    success: 'Thanks for your message! <br /> I will reply as soon as possible.',
    error:
      'There was an error sending your message, please try again or contact me through another channel',
    form: {
      sendMeAMessage: "Let's be friends? Work together?",
      firstnameLabel: 'First name',
      firstnamePlaceholder: 'Enter your first name',
      lastnameLabel: 'Last name',
      lastnamePlaceholder: 'Enter your last name',
      emailLabel: 'Email',
      emailPlaceholder: 'Enter your email',
      messageLabel: 'Message',
      submit: 'Send',
    },
  },
  experienceItems: [
    {
      company: 'Cámara Chilena de la Construcción (CChC)',
      role: 'Software Engineer',
      date: 'Jan. 2026 - present',
      product: 'Revi – AI-Powered Permit Review',
      description:
        'Development on an AI-based platform for automated building permit review. Implementation of intelligent analysis workflows for regulatory validation.',
      techs: ['React', 'Python', 'TypeScript', 'AI'],
    },
    {
      company: 'Xerply',
      role: 'Software Engineer',
      date: 'Nov. 2024 - Dec. 2025',
      product: 'AI-powered ERP',
      description:
        'Integration with SAT (Mexico) through third parties for invoicing and payroll signing, updating the AI agents API and designing security and isolation mechanisms for multi-tenant environments. Participation in the evolution of system architecture, focusing on scalability, reliability, and intelligent agent orchestration.',
      techs: ['LangGraph', 'LangChain', 'React', 'Flask', 'Python', 'TypeScript'],
    },
    {
      company: 'Hoktus',
      role: 'Software Engineer',
      date: 'Aug. 2025 - Nov. 2025',
      product: 'Recruitment agent',
      description:
        'Design and development of a system to configure custom AI agents via WhatsApp, focused on recruitment and onboarding processes. Automation of candidate interaction for high-turnover positions, reducing operational load and selection times.',
      techs: ['LangGraph', 'AI Agents', 'React', 'TypeScript', 'Python'],
    },
    {
      company: 'Blar AI',
      role: 'Software Engineer',
      date: 'Oct. 2024 - Jul. 2025',
      product: 'Code review agent',
      description:
        'Development of automated code review agents integrated into the pull request workflow. Implementation of design pattern analysis, bug detection, security vulnerabilities, and performance issues through contextual code exploration techniques. Contribution to improving software quality and review speed in development teams.',
      techs: ['LangGraph', 'Python', 'RAG', 'React', 'TypeScript'],
    },
    {
      company: 'Pirrol LLC',
      role: 'Backend Engineer',
      date: 'May 2024 - Oct. 2024',
      product: 'Financial chatbot (UpWorth – Australia)',
      description:
        'Development of an MVP personal finance conversational chatbot. Design of agent architecture and integration with financial APIs for expense analysis, savings, and user financial behavior, as well as transaction categorization. Participation in key design decisions to ensure scalability and clarity in financial data interpretation.',
      techs: ['LangGraph', 'Vertex AI', 'Python', 'LangChain', 'Next.js'],
    },
  ],
  projectItems: [
    {
      title: 'The Stack',
      description:
        'Hacker News for Latin America. A tech content index to centralize human, original, and quality content: side projects, blogs, ecosystem news, technical reflections, and meetups. Save the internet.',
      image: '/thestack-mini.jpeg',
      link: 'https://thestack.cl',
      repo: 'https://github.com/emersoftware/thestack',
      techs: [],
    },
    {
      title: 'Themis',
      description:
        'AI-powered automated audit of public tenders. Analyzes tenders from Mercado Público to detect regulatory violations, suspicious patterns, and irregularities. First place in the Legacy track at Platanus Hack 25.',
      image: '/themis-mini.jpeg',
      imageSize: 'md',
      link: 'https://themis.lat',
      repo: 'https://github.com/v4rgas/themis.lat',
      techs: [],
    },
    {
      title: 'Kapin',
      description:
        'Product metrics audit agent for software repositories. Analyzes repositories and delivers relevant metrics, queries to measure them, and the technical foundation to persist data. Reduces friction between development and measurement.',
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
