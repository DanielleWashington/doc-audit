'use client';

const CONTENT = {
  'api-auth': {
    eyebrow: 'Scenario 01 — API Authentication',
    title: 'The same content, written two different ways.',
    kb: {
      kicker: 'The Knowledge Base',
      headline: 'Authentication and Authorization Reference',
      body: `This platform supports API key authentication, OAuth 2.0 with authorization code, client credentials, and implicit grant types, JWT bearer tokens with configurable signing algorithms, HMAC-SHA256 request signatures, mutual TLS for service-to-service scenarios, and SAML 2.0 for enterprise identity provider integration. Rate limiting is enforced per credential. Token expiration windows, rotation schedules, and permission scopes are configurable via the admin API or dashboard. For SDK-level implementation, see the language-specific guides in the developer reference.`,
    },
    ds: {
      kicker: 'The Decision System',
      headline: 'Which authentication method is actually right for you?',
      body: `If you are building a service that talks to another service with no human in the loop, use an API key. It is boring, it works, and you will not regret it. If you are building something where a real person logs in, use OAuth 2.0, specifically the authorization code flow for web apps and PKCE for anything mobile or CLI. JWT is worth the overhead in exactly one situation: a downstream service needs to read claims out of the token without calling back to validate it. If nothing in your system needs that, you do not need JWT. Start with the simplest thing that closes your threat model.`,
    },
  },
  'deploy': {
    eyebrow: 'Scenario 02 — Deployment Model',
    title: 'The same content, written two different ways.',
    kb: {
      kicker: 'The Knowledge Base',
      headline: 'Deployment Architecture and Configuration',
      body: `The platform supports four deployment configurations: single-node for development and low-availability environments, multi-node cluster with active-passive failover for moderate availability requirements, multi-node cluster with active-active replication for high availability, and Kubernetes operator mode with custom resource definitions for container-orchestrated environments. Hardware sizing recommendations, network topology requirements, and storage configuration prerequisites for each mode are documented in the Architecture Reference. Migration paths between deployment configurations are covered in the Operations Guide.`,
    },
    ds: {
      kicker: 'The Decision System',
      headline: 'What deployment model do you actually need right now?',
      body: `If you have fewer than ten services and nobody is on call yet, start with single-node. It will handle more than you think, and you can migrate when you have a real reason to. If you are already Kubernetes-native, use the operator, it is the path of least resistance and you already understand the mental model. Active-passive is the right call for teams where planned downtime is acceptable and operational complexity is not. Active-active is for the day when being down costs more than the complexity of staying up. You will know when that day arrives. Do not build for it before it comes.`,
    },
  },
  'observability': {
    eyebrow: 'Scenario 03 — Observability Stack',
    title: 'The same content, written two different ways.',
    kb: {
      kicker: 'The Knowledge Base',
      headline: 'Observability and Monitoring Reference',
      body: `The platform exposes metrics in Prometheus exposition format via a configurable scrape endpoint. Distributed tracing is supported via OpenTelemetry with OTLP, Jaeger, and Zipkin exporters. Structured logging outputs to stdout in JSON format with configurable log levels, field schemas, and sampling policies. All three signal types support third-party backend integration. Retention periods, cardinality limits, and sampling rates are configurable per environment. See the Observability Reference for the complete list of exposed metrics and their semantics.`,
    },
    ds: {
      kicker: 'The Decision System',
      headline: 'What do you actually need to instrument first?',
      body: `Start with logs. You already have them, they cost almost nothing to improve, and they will answer most of your questions. Add metrics when you find yourself asking how often something happens or how fast it goes and log queries stop being useful. Add distributed tracing when you have services talking to each other and you are debugging something that crosses a boundary and logs from both sides still cannot tell you which hop broke. Do not stand up all three on day one. You will not maintain what you do not need yet, and you will resent the overhead.`,
    },
  },
};

export default function ContrastDemo({ scenario }) {
  const content = CONTENT[scenario] ?? CONTENT['api-auth'];

  return (
    <section id="contrast">
      <div className="contrast-header">
        <div>
          <p className="contrast-header-eyebrow">{content.eyebrow}</p>
          <h2 className="contrast-header-title">{content.title}</h2>
        </div>
        <p className="contrast-header-note">Same facts. Different intent.</p>
      </div>
      <div className="contrast-grid">
        <div className="contrast-col kb-col">
          <p className="col-kicker">{content.kb.kicker}</p>
          <h3 className="col-headline">{content.kb.headline}</h3>
          <p className="col-body">{content.kb.body}</p>
        </div>
        <div className="contrast-col ds-col">
          <p className="col-kicker">{content.ds.kicker}</p>
          <h3 className="col-headline">{content.ds.headline}</h3>
          <p className="col-body">{content.ds.body}</p>
        </div>
      </div>
    </section>
  );
}
