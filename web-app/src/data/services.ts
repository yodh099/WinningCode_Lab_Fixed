export interface ServiceData {
    id: string;
    title: string;
    description: string;
    fullDescription: string;
    image: string;
    techStack: string[];
    features: string[];
}

export const servicesData: Record<string, ServiceData> = {
    'web-development': {
        id: 'web-development',
        title: 'Web Development',
        description: 'Modern, responsive, and high-performance websites.',
        fullDescription: 'We build digital experiences that matter. From landing pages to complex web applications, our code is clean, fast, and scalable. We focus on creating websites that not only look great but also perform exceptionally well, ensuring a seamless user experience across all devices.',
        image: '/images/services/web-development.png',
        techStack: [
            'HTML, CSS, JavaScript, TypeScript',
            'React, Next.js, Vue',
            'TailwindCSS, Shadcn UI',
            'Node.js, Express, Supabase, Firebase',
            'AI tools (Code generation, Refactoring, Testing)',
            'Vercel, Netlify, AWS, Cloudflare'
        ],
        features: [
            'Responsive Design',
            'SEO Optimization',
            'Performance Tuning',
            'CMS Integration',
            'E-commerce Solutions'
        ]
    },
    'mobile-apps': {
        id: 'mobile-apps',
        title: 'Mobile Apps',
        description: 'Native and cross-platform mobile applications.',
        fullDescription: 'Reach your users wherever they are. We develop native and cross-platform apps that deliver seamless performance and intuitive interfaces. Whether you need an iOS app, an Android app, or both, we have the expertise to bring your vision to life.',
        image: '/images/services/mobile-apps.png',
        techStack: [
            'React Native, Flutter, Expo',
            'Kotlin, Swift',
            'Firebase, Supabase',
            'Mobile AI Automation Tools',
            'Push Notifications',
            'Offline Capabilities'
        ],
        features: [
            'Cross-Platform Compatibility',
            'Native Performance',
            'Intuitive UI/UX',
            'App Store Deployment',
            'Real-time Updates'
        ]
    },
    'ai-automation': {
        id: 'ai-automation',
        title: 'AI Automation',
        description: 'Intelligent workflows to streamline your business.',
        fullDescription: 'Harness the power of Artificial Intelligence. We automate repetitive tasks, analyze data, and build smart systems that learn and adapt. Our AI solutions are designed to increase efficiency, reduce costs, and provide actionable insights.',
        image: '/images/services/ai-automation.png',
        techStack: [
            'Python, TensorFlow, PyTorch',
            'OpenAI API, Anthropic Claude',
            'LangChain, AutoGPT',
            'Zapier, Make (Integromat)',
            'Custom AI Agents',
            'Machine Learning Models'
        ],
        features: [
            'Workflow Automation',
            'Chatbots & Virtual Assistants',
            'Data Analysis & Prediction',
            'Natural Language Processing',
            'Process Optimization'
        ]
    },
    'branding': {
        id: 'branding',
        title: 'Branding',
        description: 'Identity design that resonates with your audience.',
        fullDescription: 'Your brand is your story. We craft visual identities, logos, and design systems that communicate your values and captivate your audience. We believe that a strong brand is the foundation of a successful business.',
        image: '/images/services/branding.png',
        techStack: [
            'Adobe Creative Suite (Ps, Ai, Id)',
            'Figma, Sketch',
            'AI Design Tools (Midjourney, DALL-E)',
            'Color Theory & Typography',
            'Brand Guidelines',
            'Visual Strategy'
        ],
        features: [
            'Logo Design',
            'Visual Identity Systems',
            'Brand Strategy',
            'Marketing Materials',
            'UI/UX Design'
        ]
    },
    'digital-solutions': {
        id: 'digital-solutions',
        title: 'Digital Solutions',
        description: 'Custom software solutions for complex problems.',
        fullDescription: 'No problem is too complex. We engineer custom software solutions tailored specifically to your unique business challenges. From internal tools to customer-facing platforms, we build software that drives growth and innovation.',
        image: '/images/services/digital-solutions.png',
        techStack: [
            'Custom API Development',
            'Cloud Architecture (AWS, Azure, GCP)',
            'Microservices',
            'Docker, Kubernetes',
            'Database Design (SQL, NoSQL)',
            'System Integration'
        ],
        features: [
            'Scalable Architecture',
            'Secure Data Handling',
            'API Integration',
            'Legacy System Modernization',
            'Real-time Analytics'
        ]
    },
    'workflow-systems': {
        id: 'workflow-systems',
        title: 'Workflow Systems',
        description: 'Optimized processes for maximum efficiency.',
        fullDescription: 'Efficiency is key. We analyze your operations and build digital systems that eliminate bottlenecks and supercharge productivity. Our workflow solutions are designed to streamline your business processes and empower your team.',
        image: '/images/services/workflow-systems.png',
        techStack: [
            'ERP & CRM Development',
            'Business Process Management (BPM)',
            'Low-Code/No-Code Platforms',
            'Internal Dashboards',
            'Automation Logic',
            'AI Decision Support'
        ],
        features: [
            'Process Mapping',
            'Bottleneck Analysis',
            'Custom Dashboards',
            'Team Collaboration Tools',
            'Performance Tracking'
        ]
    }
};
