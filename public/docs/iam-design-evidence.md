# AWS IAM — sanitized team design evidence

Accepted team ADR: separate role groups, SAML 2.0 federation through IAM Identity Center, mandatory MFA, temporary STS credentials for workloads and partners. Design targets: no shared credentials, no wildcard production actions, explicit deny for deletion of rental-condition photos. Original team diagram reproduced as a redacted preview. No exported policy, trust policy, CloudTrail, Access Analyzer or allow/deny test recovered. Design acceptance is not runtime enforcement.
