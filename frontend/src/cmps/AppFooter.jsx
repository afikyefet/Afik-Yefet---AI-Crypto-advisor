export const contacts = [
  {
    name: 'Phone',
    url: 'tel:+972525530451',
    icon: 'phone',
    description: '+972-52-553-0451',
  },
  {
    name: 'Email',
    url: 'mailto:afik.yefet@gmail.com',
    icon: 'mail',
    description: 'Get in touch',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/afik-yefet-906757326/',
    icon: 'work',
    description: 'Professional profile',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/afikyefet',
    icon: 'code',
    description: 'Code & projects',
  },
  {
    name: 'LeetCode',
    url: 'https://leetcode.com/u/afikyefet/',
    icon: 'psychology',
    description: 'Problem solving',
  },
  {
    name: 'Website',
    url: 'https://afikyefet.com',
    icon: 'language',
    description: 'Portfolio website',
  }
];

export function AppFooter() {
  return (
    <footer className="app-footer-container">
      <div className="app-footer-content">
        <p className="app-footer-text">Connect with me</p>
        <div className="app-footer-links">
          {contacts.map((contact) => (
            <a
              key={contact.name}
              href={contact.url}
              target={contact.url.startsWith('http') ? '_blank' : undefined}
              rel={contact.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="app-footer-link"
              title={contact.description}
            >
              <span className="material-icons">{contact.icon}</span>
              <span className="app-footer-link-text">{contact.name}</span>
            </a>
          ))}
        </div>
        <p className="app-footer-copyright">
          © {new Date().getFullYear()} Afik Yefet. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
