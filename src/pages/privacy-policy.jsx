import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const sections = [
  {
    title: "Information We Collect",
    items: [
      "Account details such as name, email address, phone number, and branch assignments provided by administrators.",
      "Operational data related to inventory, reservations, pricing actions, loyalty usage, and payment preferences managed through the platform.",
    ]
  },
  {
    title: "How We Use Information",
    items: [
      "Operate, maintain, and secure Tiger Bar Exchange services for administrators and staff.",
      "Provide real-time pricing updates that help optimize bar operations.",
      "Detect, investigate, and prevent fraudulent or unauthorized activity."
    ]
  },
  {
    title: "Sharing and Disclosure",
    items: [
      "Service providers that support hosting, analytics, communication, payment processing, and customer support, all bound by confidentiality obligations.",
      "Business partners such as point-of-sale or payment integrations when necessary to deliver requested features.",
      "Legal or regulatory authorities when required to comply with applicable law, court orders, or enforce our agreements."
    ]
  },
  {
    title: "Data Retention",
    items: [
      "Account and transactional records are retained while the organization maintains an active subscription or as otherwise required by law.",
      "Backups and audit logs may persist for additional periods to support security, compliance, and disaster recovery.",
      "Information is securely deleted or anonymized once retention requirements expire."
    ]
  },
  {
    title: "Security",
    items: [
      "Role-based access controls, authentication requirements, and encryption safeguards protect stored and transmitted data.",
      "Monitoring and logging detect unusual activity and enable timely incident response.",
      "Vendors and integrations are evaluated to ensure they meet comparable security obligations."
    ]
  },
  {
    title: "Your Choices",
    items: [
      "Administrators may review and update account information within the platform settings.",
    ]
  },
  {
    title: "International Transfers",
    items: [
      "Data may be processed in jurisdictions where our infrastructure or service providers operate, which could be outside the country of collection.",
      "Appropriate safeguards, such as contractual clauses and security controls, are applied to protect data during cross-border transfers."
    ]
  },
  {
    title: "Children's Privacy",
    items: [
      "Tiger Bar Exchange is not intended for individuals under the legal drinking age, and we do not knowingly collect information from minors.",
      "If a minor's data is inadvertently collected, contact Tiger Bar Exchange so the information can be removed."
    ]
  },
  {
    title: "Policy Updates",
    items: [
      "This Privacy Policy may be updated to reflect operational, legal, or regulatory changes.",
    ]
  }
];

export function PrivacyPolicy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Effective date: 22 October 2025</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Tiger Bar Exchange provides tools that enable bars and restaurants to manage dynamic pricing, reservations, and loyalty operations. This Privacy Policy explains how we handle personal and operational information within the admin platform.</p>
          <p>By using the admin portal, you confirm that you are authorized to administer the account on behalf of your organization and consent to the practices described below.</p>
        </CardContent>
      </Card>

      {sections.map(section => (
        <Card key={section.title}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 list-disc pl-6 text-sm text-muted-foreground">
              {section.items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
