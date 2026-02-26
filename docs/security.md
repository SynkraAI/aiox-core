# Security Policy

> 🇧🇷 [Versão em Português](SECURITY-PT.md)

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| < 2.1   | :x:                |

## Reporting a Vulnerability

We take security seriously at SynkraAI. If you discover a security vulnerability in AIOS, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security vulnerabilities through one of these channels:

1. **GitHub Security Advisories** (Preferred)
   - Go to [Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **GitHub Issues (Private)**
   - Open a [private security advisory](https://github.com/SynkraAI/aios-core/security/advisories)
   - Use subject line: `[SECURITY] Brief description`

### What to Include

Please include the following in your report:

- **Description**: A clear description of the vulnerability
- **Impact**: What could an attacker achieve with this vulnerability?
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Versions**: Which versions are affected?
- **Possible Fix**: If you have suggestions for how to fix the issue
- **Your Information**: Name/handle for acknowledgment (optional)

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt within 48 hours
2. **Initial Assessment**: We will provide an initial assessment within 5 business days
3. **Updates**: We will keep you informed of our progress
4. **Resolution**: We aim to resolve critical issues within 30 days
5. **Disclosure**: We will coordinate disclosure timing with you

### Safe Harbor

We consider security research conducted in accordance with this policy to be:

- Authorized concerning any applicable anti-hacking laws
- Authorized concerning any relevant anti-circumvention laws
- Exempt from restrictions in our Terms of Service that would interfere with conducting security research

We will not pursue civil action or initiate a complaint to law enforcement for accidental, good faith violations of this policy.

## Security Best Practices

When using AIOS Framework, we recommend:

### Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` as a template without real values
- Rotate API keys and secrets regularly

### MCP Server Security

- Only enable MCP servers from trusted sources
- Review MCP server code before enabling
- Use sandboxed execution environments when available
- Limit MCP server permissions to minimum required

### AI Agent Security

- Be cautious with agent commands that execute system operations
- Review generated code before execution in production
- Use appropriate access controls for sensitive operations

### Dependency Management

- Keep dependencies up to date
- Run `npm audit` regularly
- Review dependency changes in pull requests

## Known Security Considerations

### Framework Architecture

AIOS Framework executes AI-generated code and commands. Users should:

- Understand that AI agents can execute arbitrary code
- Use appropriate sandboxing for untrusted environments
- Review AI-generated output before production deployment

### Data Handling

- AIOS may process sensitive data through AI providers
- Review your AI provider's data handling policies
- Consider data classification when using AI features

## Security Updates

Security updates are announced through:

- [GitHub Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
- [CHANGELOG.md](./CHANGELOG.md)
- GitHub Releases

## Acknowledgments

We thank the following researchers for responsibly disclosing security issues:

*No reports yet - be the first!*

---

*This security policy is effective as of December 2024.*
*Last updated: 2025-12-11*
