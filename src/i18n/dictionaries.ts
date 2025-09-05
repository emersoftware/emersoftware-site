import type { SupportedLocale } from './config';

export type ExperienceItem = {
  date: string;
  title: string;
  description: string;
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
  sections: {
    experience: string;
    contact: string;
  };
  sectionIds: {
    home: string;
    experience: string;
    contact: string;
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
};

const es: Dictionary = {
  metaTitle: 'Emersoftware - Emerson Salazar Rubilar',
  metaDescription:
    'Emerson Salazar Rubilar (emersoftware) Desarrollador Web Fullstack IA Python de Concepción, Chile. Haz tu proyecto web con este programador con tecnologías como JavaScript, NextJS, ReactJS, Astro o Python. Desarrolla landing pages, ecommerce o aplicaciones basadas en inteligencia artificial.',
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
      'Me gustan todas las áreas del desarrollo de productos de software. Actualmente enfocado en diseñar y crear agentes y flujos de IA. Principalmente he trabajado en startups.',
    email: 'hola@emersoftware.cl',
  },
  sections: {
    experience: 'Experiencia',
    contact: 'Contacto',
  },
  sectionIds: {
    home: 'inicio',
    experience: 'experiencia',
    contact: 'contacto',
  },
  contact: {
    success: 'Gracias por tu mensaje! <br /> Te responderé lo antes posible.',
    error:
      'Hubo un error al enviar tu mensaje, por favor intenta de nuevo o contactame por otro medio',
    form: {
      sendMeAMessage: 'Envíame un mensaje',
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
      date: 'ago. 2025 - actualidad',
      title: 'Hoktus | Software Engineer',
      description:
        '[NUEVO] Desarrollo de agentes conversacionales y automatización de procesos de reclutamiento con AI Agents.',
      techs: ['Langgraph', 'AI Agents', 'NextJS', 'Typescript', 'Python'],
    },
    {
      date: 'oct. 2024 - jul. 2025',
      title: 'Blar AI | Software Engineer',
      description:
        'Desarrollo de agentes revisión de código. Principalmente revisión de patrones de diseño, bugs, cybersec y performance, en pull requests.',
      techs: ['Langgraph', 'Python', 'RAG', 'React', 'Typescript'],
    },
    {
      date: 'may. 2024 - oct. 2024',
      title: 'Pirrol LLC | Backend Engineer',
      description:
        'Desarrollo de MVP de agente conversacional (chatbot) para UpWorth AUS sobre finanzas personales.',
      techs: ['Langgraph', 'Vertex AI', 'Python', 'Langchain', 'NextJS', 'Typescript'],
    },
  ],
};

const en: Dictionary = {
  metaTitle: 'Emersoftware - Emerson Salazar Rubilar',
  metaDescription:
    'Emerson Salazar Rubilar (emersoftware) Fullstack Web Developer & AI Python from Concepción, Chile. Build your web project with technologies like JavaScript, NextJS, ReactJS, Astro or Python. Landing pages, ecommerce, and AI-based applications.',
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
      'I enjoy all areas of software product development. Currently focused on designing and building AI agents and workflows. I have mostly worked in startups.',
    email: 'hola@emersoftware.cl',
  },
  sections: {
    experience: 'Experience',
    contact: 'Contact',
  },
  sectionIds: {
    home: 'home',
    experience: 'experience',
    contact: 'contact',
  },
  contact: {
    success: 'Thanks for your message! <br /> I will reply as soon as possible.',
    error:
      'There was an error sending your message, please try again or contact me through another channel',
    form: {
      sendMeAMessage: 'Send me a message',
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
      date: 'Aug. 2025 - present',
      title: 'Hoktus | Software Engineer',
      description: '[NEW] Conversational agents and recruitment process automation with AI Agents.',
      techs: ['Langgraph', 'AI Agents', 'NextJS', 'Typescript', 'Python'],
    },
    {
      date: 'Oct. 2024 - Jul. 2025',
      title: 'Blar AI | Software Engineer',
      description:
        'Code review agents. Focused on design patterns, bugs, cybersec and performance in pull requests.',
      techs: ['Langgraph', 'Python', 'RAG', 'React', 'Typescript'],
    },
    {
      date: 'May 2024 - Oct. 2024',
      title: 'Pirrol LLC | Backend Engineer',
      description:
        'Built an MVP of a conversational agent (chatbot) for UpWorth AUS on personal finance.',
      techs: ['Langgraph', 'Vertex AI', 'Python', 'Langchain', 'NextJS', 'Typescript'],
    },
  ],
};

export function getDictionary(lang: SupportedLocale): Dictionary {
  return lang === 'en' ? en : es;
}
