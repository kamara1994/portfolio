export interface TimelineEvent {
  id: string
  time: string
  title: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  description: string
}

export interface EvidenceCard {
  id: string
  type: 'email' | 'log' | 'query' | 'ioc' | 'note' | 'mitre'
  title: string
  content: string
  highlight?: string
}

export interface MitreMapping {
  technique: string
  id: string
  tactic: string
  description: string
}

export interface ResponseStep {
  id: string
  action: string
  mode: 'automated' | 'analyst-required' | 'recommended'
  detail: string
}

export interface Incident {
  id: string
  num: string
  title: string
  subtitle: string
  summary: string
  category: string
  severity: 'critical' | 'high' | 'medium'
  color: string
  timeline: TimelineEvent[]
  evidence: EvidenceCard[]
  mitre: MitreMapping[]
  response: ResponseStep[]
  splunkQuery: string
  analystConclusion: string
  lessonsLearned: string
}

export const incidents: Incident[] = [
  {
    id: 'phishing-account-compromise',
    num: '001',
    title: 'Phishing Email → Account Compromise',
    subtitle: 'Suspicious email leads to credential theft and unauthorized sign-in',
    summary: 'A user received a phishing email impersonating a financial institution. Analysis identified a typosquatted sender domain and a credential-harvesting URL. Several hours later, a suspicious sign-in from an unfamiliar Windows device was detected. The incident was classified as probable credential compromise.',
    category: 'Identity & Access',
    severity: 'high',
    color: '#ef4444',
    timeline: [
      { id: 't1', time: '11:59 AM', title: 'Phishing Email Received', severity: 'high', description: 'User receives email appearing to be from a financial institution. Sender domain flagged by email gateway.' },
      { id: 't2', time: '12:04 PM', title: 'Email Forwarded to Security', severity: 'medium', description: 'User forwards suspicious email to security team after noticing unusual sender address.' },
      { id: 't3', time: '12:18 PM', title: 'Domain Analysis Started', severity: 'info', description: 'Analyst begins investigation. Sender domain identified as typosquatted — one character different from legitimate institution.' },
      { id: 't4', time: '12:31 PM', title: 'Malicious URL Extracted', severity: 'high', description: 'Credential-harvesting URL identified in email body. URL leads to a spoofed login page mimicking the financial institution.' },
      { id: 't5', time: '01:53 PM', title: 'MFA Activity Observed', severity: 'high', description: 'Unexpected MFA push notification activity detected on user account. Possible authentication attempt in progress.' },
      { id: 't6', time: '08:49 PM', title: 'Suspicious Sign-In Alert', severity: 'critical', description: 'New Windows device sign-in detected for affected user. Device profile inconsistent with known user devices. Geographic location anomalous.' },
      { id: 't7', time: '08:52 PM', title: 'Account Flagged', severity: 'critical', description: 'User account flagged for immediate review. Session review and credential reset initiated.' },
      { id: 't8', time: '09:10 PM', title: 'Containment Complete', severity: 'info', description: 'Account credentials reset. Active sessions revoked. MFA re-enrolled on verified device. Incident documented.' },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'email',
        title: 'Phishing Email Header Analysis',
        content: `From: security@firstnationaI-bank.com
To: user@company.com
Subject: Urgent: Verify Your Account

Return-Path: <bounce@firstnationaI-bank.com>
Received: from mail.firstnationaI-bank.com

ANALYSIS:
• Sender domain: firstnationaI-bank.com
• Legitimate domain: firstnational-bank.com
• Difference: lowercase "L" replaced with capital "I"
• Classic typosquatting technique`,
        highlight: 'firstnationaI-bank.com vs firstnational-bank.com',
      },
      {
        id: 'e2',
        type: 'ioc',
        title: 'Extracted IOCs (Defanged)',
        content: `MALICIOUS DOMAIN:
  firstnationaI-bank[.]com

CREDENTIAL HARVEST URL:
  hxxps://firstnationaI-bank[.]com/verify/login[.]php

IP ADDRESS:
  185[.]220[.]101[.]47

REGISTRAR: NameCheap (registered 3 days prior to attack)
HOSTING: Bulletproof hosting provider
SSL CERT: Self-signed, issued same day as domain`,
        highlight: '185[.]220[.]101[.]47',
      },
      {
        id: 'e3',
        type: 'log',
        title: 'Suspicious Sign-In Log Entry',
        content: `TIMESTAMP: 2026-03-14 20:49:33 UTC
EVENT: New device sign-in
USER: affected.user@company.com
DEVICE: Windows 11 — Unknown Device ID
LOCATION: Eastern Europe (anomalous)
IP: 185.220.101.47
RISK SCORE: 94/100
MFA STATUS: Bypassed (session token reuse suspected)

BASELINE COMPARISON:
  Known devices: MacBook Pro, iPhone 14
  Known locations: Philadelphia PA, New York NY
  This device: NOT in baseline
  This location: NOT in baseline`,
        highlight: 'RISK SCORE: 94/100',
      },
      {
        id: 'e4',
        type: 'query',
        title: 'Splunk SPL Query Used',
        content: `index=auth_logs sourcetype=o365:management
| where user="affected.user@company.com"
| where EventTime > relative_time(now(), "-24h")
| eval risk=if(match(ClientIP,"185\\.220\\."),
    "HIGH", "NORMAL")
| table EventTime, Operation, ClientIP,
    UserAgent, ResultStatus, risk
| sort -EventTime`,
        highlight: 'risk=if(match(ClientIP',
      },
      {
        id: 'e5',
        type: 'note',
        title: 'Analyst Investigation Notes',
        content: `INVESTIGATION SUMMARY:

1. Email domain typosquat confirmed — "I" (capital i) 
   used instead of "l" (lowercase L). Visually identical
   in most fonts. Classic social engineering technique.

2. Credential-harvesting page mimics legitimate bank UI.
   Page source copied from real site with modified form
   action pointing to attacker infrastructure.

3. MFA activity at 1:53 PM suggests user may have 
   entered credentials on phishing page. Attacker 
   attempted MFA bypass via push notification fatigue
   or real-time relay.

4. Sign-in at 8:49 PM from anomalous device/location
   confirms credential compromise. 8-hour gap suggests
   attacker waited for low-activity period.

CONFIDENCE: HIGH — Probable credential compromise`,
        highlight: 'CONFIDENCE: HIGH',
      },
    ],
    mitre: [
      { technique: 'Phishing: Spearphishing Link', id: 'T1566.002', tactic: 'Initial Access', description: 'Attacker sent a targeted phishing email containing a link to a credential-harvesting page.' },
      { technique: 'Web Portal Capture', id: 'T1056.003', tactic: 'Credential Access', description: 'Spoofed login page captured user credentials upon entry.' },
      { technique: 'Valid Accounts', id: 'T1078', tactic: 'Defense Evasion', description: 'Attacker used stolen valid credentials to authenticate, bypassing standard detection.' },
      { technique: 'Multi-Factor Authentication Interception', id: 'T1111', tactic: 'Credential Access', description: 'Evidence suggests MFA push notification fatigue or real-time relay attempt.' },
    ],
    response: [
      { id: 'r1', action: 'Extract and defang IOCs', mode: 'automated', detail: 'n8n workflow automatically extracts and defangs URLs, IPs, and domains from alert context.' },
      { id: 'r2', action: 'Enrich domain reputation', mode: 'automated', detail: 'VirusTotal and AbuseIPDB APIs queried automatically for domain and IP reputation scores.' },
      { id: 'r3', action: 'Assign severity score', mode: 'automated', detail: 'Risk score calculated based on IOC reputation, user risk profile, and behavioral anomalies.' },
      { id: 'r4', action: 'Notify analyst via Telegram', mode: 'automated', detail: 'Structured alert sent to analyst with full context, IOCs, and recommended actions.' },
      { id: 'r5', action: 'Disable user account', mode: 'analyst-required', detail: 'Account suspension requires analyst approval to prevent false-positive business disruption.' },
      { id: 'r6', action: 'Revoke active sessions', mode: 'analyst-required', detail: 'All active sessions terminated after analyst confirms compromise. Prevents continued access.' },
      { id: 'r7', action: 'Block IOCs at firewall', mode: 'analyst-required', detail: 'Palo Alto block rule created for malicious IP and domain after analyst review and approval.' },
      { id: 'r8', action: 'Force MFA re-enrollment', mode: 'recommended', detail: 'User required to re-enroll MFA on verified device before account restoration.' },
    ],
    splunkQuery: `index=auth_logs sourcetype=o365:management
| where user="affected.user@company.com"
| where EventTime > relative_time(now(), "-24h")
| eval risk=if(match(ClientIP,"185\\.220\\."), "HIGH", "NORMAL")
| table EventTime, Operation, ClientIP, UserAgent, ResultStatus, risk
| sort -EventTime`,
    analystConclusion: 'High-confidence credential compromise via phishing. User credentials captured through typosquatted domain. Attacker authenticated 8 hours later from anomalous device bypassing MFA. Account contained, sessions revoked, credentials reset. IOCs blocked at perimeter. User security awareness training recommended.',
    lessonsLearned: 'Email gateway rules updated to flag typosquatted domains. MFA push notification limits tightened. User training on visual domain inspection. Automated response playbook validated end-to-end.',
  },
  {
    id: 'malware-c2-beaconing',
    num: '002',
    title: 'Malware Delivery → C2 Beaconing',
    subtitle: 'Suspicious executable triggers command-and-control traffic',
    summary: 'Network monitoring detected a suspicious executable downloaded from an untrusted source. Analysis revealed C2 beaconing activity with consistent 60-second intervals. IOCs extracted and defanged. MITRE ATT&CK techniques mapped. Automated containment workflow triggered after analyst approval.',
    category: 'Malware & C2',
    severity: 'critical',
    color: '#a855f7',
    timeline: [
      { id: 't1', time: '02:14 AM', title: 'Suspicious Download Detected', severity: 'high', description: 'Endpoint detection triggers on executable download from non-corporate domain. File hash not in approved software list.' },
      { id: 't2', time: '02:15 AM', title: 'Process Execution Alert', severity: 'critical', description: 'Downloaded executable runs. Process tree shows unusual parent-child relationship. Spawns cmd.exe with encoded arguments.' },
      { id: 't3', time: '02:16 AM', title: 'C2 Beacon Initiated', severity: 'critical', description: 'Network traffic to external IP detected. Regular 60-second interval beaconing pattern identified. Traffic uses HTTPS to blend with legitimate traffic.' },
      { id: 't4', time: '02:18 AM', title: 'Beacon Pattern Confirmed', severity: 'critical', description: 'Statistical analysis confirms beacon interval: 60s ± 2s jitter. Consistent with Cobalt Strike or similar C2 framework.' },
      { id: 't5', time: '02:31 AM', title: 'Exfiltration Attempt Detected', severity: 'critical', description: 'Outbound data volume spike detected. DNS queries to unusual domains suggest DNS tunneling attempt.' },
      { id: 't6', time: '02:45 AM', title: 'Host Isolated', severity: 'info', description: 'Analyst approves host isolation. Palo Alto firewall rule blocks all traffic from compromised endpoint. C2 beaconing stops.' },
      { id: 't7', time: '03:10 AM', title: 'Forensic Collection Started', severity: 'info', description: 'Memory dump and disk image collection initiated. Process artifacts preserved for forensic analysis.' },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'log',
        title: 'Beacon Traffic Pattern',
        content: `NETWORK CAPTURE ANALYSIS:
Source: 192.168.1.45 (compromised host)
Destination: 91.199.212.52:443

BEACON INTERVALS (seconds):
  60.1, 59.8, 60.3, 61.0, 59.9, 60.2
  Average: 60.2s | Jitter: ±1.2s

TRAFFIC CHARACTERISTICS:
  Protocol: HTTPS (TLS 1.2)
  Packet size: 248-312 bytes (consistent)
  User-Agent: Mozilla/5.0 (spoofed)
  Certificate: Self-signed, CN=update.microsoft-cdn.net

VERDICT: High-confidence C2 beaconing`,
        highlight: 'Average: 60.2s | Jitter: ±1.2s',
      },
      {
        id: 'e2',
        type: 'ioc',
        title: 'Extracted IOCs (Defanged)',
        content: `MALWARE HASH (SHA256):
  a3f8c2d1e4b7901234567890abcdef12
  3456789012345678901234567890abcd

C2 SERVER:
  91[.]199[.]212[.]52:443
  update[.]microsoft-cdn[.]net (spoofed)

DOWNLOAD URL:
  hxxps://cdn-update[.]net/flash/updater[.]exe

DNS TUNNELING DOMAINS:
  data[.]telemetry-cdn[.]com
  sync[.]update-cache[.]net

PROCESS:
  updater.exe → cmd.exe → powershell.exe`,
        highlight: '91[.]199[.]212[.]52',
      },
      {
        id: 'e3',
        type: 'query',
        title: 'Splunk SPL — Beacon Detection',
        content: `index=network sourcetype=palo_alto_traffic
| where dest_ip="91.199.212.52"
| bin _time span=1m
| stats count, avg(bytes_out) as avg_bytes
    by _time, src_ip, dest_ip, dest_port
| eventstats stdev(count) as stdev_count
| where abs(count - avg(count)) < stdev_count
| eval beacon_score=round((1-(stdev_count/count))*100,1)
| where beacon_score > 85
| table _time, src_ip, dest_ip, count,
    avg_bytes, beacon_score
| sort -beacon_score`,
        highlight: 'beacon_score > 85',
      },
      {
        id: 'e4',
        type: 'note',
        title: 'Malware Analysis Notes',
        content: `STATIC ANALYSIS:
  File: updater.exe (2.4MB)
  Packer: UPX (obfuscated)
  Imports: WinINet, CreateRemoteThread
  Strings: Base64-encoded C2 config embedded

DYNAMIC ANALYSIS (sandbox):
  1. Drops persistence: HKCU\\Run\\WindowsUpdater
  2. Spawns cmd.exe with -enc (encoded PS)
  3. Establishes HTTPS beacon to C2
  4. Attempts lateral movement via SMB
  5. DNS tunneling for data exfiltration

MALWARE FAMILY: Likely Cobalt Strike beacon
  or similar commercial C2 framework

DWELL TIME: ~17 minutes before detection`,
        highlight: 'DWELL TIME: ~17 minutes',
      },
    ],
    mitre: [
      { technique: 'User Execution: Malicious File', id: 'T1204.002', tactic: 'Execution', description: 'User or process executed a malicious file downloaded from an untrusted source.' },
      { technique: 'Command and Control: Application Layer Protocol', id: 'T1071.001', tactic: 'C2', description: 'Malware used HTTPS to blend C2 traffic with legitimate web traffic.' },
      { technique: 'Scheduled Task / Boot or Logon Autostart', id: 'T1547', tactic: 'Persistence', description: 'Malware established persistence via Windows registry Run key.' },
      { technique: 'Exfiltration Over DNS', id: 'T1048.003', tactic: 'Exfiltration', description: 'DNS tunneling used to attempt data exfiltration through DNS query volume.' },
    ],
    response: [
      { id: 'r1', action: 'Hash lookup on VirusTotal', mode: 'automated', detail: 'File hash automatically submitted to VirusTotal API. Returns detection ratio and malware family classification.' },
      { id: 'r2', action: 'C2 IP reputation check', mode: 'automated', detail: 'AbuseIPDB and threat intel feeds queried automatically for C2 IP reputation and known campaigns.' },
      { id: 'r3', action: 'Beacon pattern analysis', mode: 'automated', detail: 'Statistical beacon detection algorithm runs on network logs. Flags consistent interval patterns.' },
      { id: 'r4', action: 'Isolate compromised host', mode: 'analyst-required', detail: 'Host network isolation via Palo Alto API. Requires analyst approval — false positive would cause business disruption.' },
      { id: 'r5', action: 'Block C2 IP and domains', mode: 'analyst-required', detail: 'Firewall block rules for all identified C2 infrastructure. Analyst reviews before applying to prevent legitimate traffic blocking.' },
      { id: 'r6', action: 'Preserve forensic evidence', mode: 'recommended', detail: 'Memory dump and disk image collection before remediation. Critical for full root-cause analysis.' },
    ],
    splunkQuery: `index=network sourcetype=palo_alto_traffic
| where dest_ip="91.199.212.52"
| bin _time span=1m
| stats count, avg(bytes_out) as avg_bytes by _time, src_ip, dest_ip
| eventstats stdev(count) as stdev_count
| eval beacon_score=round((1-(stdev_count/count))*100,1)
| where beacon_score > 85
| sort -beacon_score`,
    analystConclusion: 'Critical — confirmed malware infection with active C2 beaconing and exfiltration attempt. Malware family consistent with Cobalt Strike. 17-minute dwell time before detection. Host isolated, C2 blocked. Full forensic collection initiated. Lateral movement to other hosts must be investigated.',
    lessonsLearned: 'Application allowlisting would have prevented execution. Beacon detection rule tuned and added to detection library. DNS tunneling monitoring enhanced. Incident response playbook for C2 beaconing updated.',
  },
  {
    id: 'cloud-misconfiguration',
    num: '003',
    title: 'Cloud Misconfiguration → Exposed S3',
    subtitle: 'Public S3 bucket detected with sensitive data exposure risk',
    summary: 'AWS GuardDuty and Security Hub detected a publicly accessible S3 bucket containing files with naming conventions suggesting sensitive data. Automated Lambda remediation workflow triggered. Bucket access blocked within 90 seconds of detection. No confirmed exfiltration identified.',
    category: 'Cloud Security',
    severity: 'high',
    color: '#f59e0b',
    timeline: [
      { id: 't1', time: '09:03 AM', title: 'GuardDuty Finding Generated', severity: 'high', description: 'AWS GuardDuty generates Policy:S3/BucketBlockPublicAccessDisabled finding. S3 bucket public access controls removed.' },
      { id: 't2', time: '09:03 AM', title: 'CloudTrail Event Captured', severity: 'high', description: 'CloudTrail logs PutBucketPublicAccessBlock API call with BlockPublicAccess set to false. IAM user identified.' },
      { id: 't3', time: '09:04 AM', title: 'Lambda Remediation Triggered', severity: 'info', description: 'CloudWatch Events rule triggers Lambda function on GuardDuty finding. Automated remediation workflow begins.' },
      { id: 't4', time: '09:04 AM', title: 'Bucket Contents Inventoried', severity: 'high', description: 'Lambda scans bucket object names. Files with patterns matching PII conventions identified (SSN, DOB, email patterns in filenames).' },
      { id: 't5', time: '09:05 AM', title: 'SNS Alert Sent', severity: 'info', description: 'SNS notification dispatched to security team. Alert includes bucket name, IAM user, GuardDuty finding ID, and recommended actions.' },
      { id: 't6', time: '09:06 AM', title: 'Public Access Re-blocked', severity: 'info', description: 'Analyst approves Lambda remediation. S3 public access block re-enabled. Bucket ACL reviewed and corrected.' },
      { id: 't7', time: '09:45 AM', title: 'Access Log Review Complete', severity: 'info', description: 'S3 server access logs reviewed for 24-hour window. No unauthorized external downloads confirmed in log data.' },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'log',
        title: 'CloudTrail Event Log',
        content: `CLOUDTRAIL EVENT:
EventName: PutBucketPublicAccessBlock
EventTime: 2026-04-02T09:03:14Z
UserIdentity:
  type: IAMUser
  userName: dev-deploy-user
  accountId: 123456789012
RequestParameters:
  bucketName: company-data-backup-prod
  PublicAccessBlockConfiguration:
    BlockPublicAcls: false
    IgnorePublicAcls: false
    BlockPublicPolicy: false
    RestrictPublicBuckets: false
sourceIPAddress: 203.0.113.42
userAgent: aws-cli/2.x

RISK: ALL public access controls removed`,
        highlight: 'BlockPublicAcls: false',
      },
      {
        id: 'e2',
        type: 'ioc',
        title: 'Affected Resource Details',
        content: `BUCKET: company-data-backup-prod
REGION: us-east-1
ACCOUNT: 123456789012

OBJECT COUNT: 1,247 files
SENSITIVE PATTERNS DETECTED:
  • *_SSN_*.csv (47 files)
  • *_customer_data_*.json (312 files)
  • employee_records_*.xlsx (23 files)

EXPOSURE WINDOW: ~3 minutes
  (09:03:14 - 09:06:02 UTC)

EXTERNAL ACCESS LOGS: No confirmed
  downloads in server access logs
  (Note: access logging has ~15min delay)`,
        highlight: 'EXPOSURE WINDOW: ~3 minutes',
      },
      {
        id: 'e3',
        type: 'query',
        title: 'Splunk SPL — S3 Access Review',
        content: `index=aws sourcetype=aws:s3:accesslogs
  bucket_name="company-data-backup-prod"
| where _time >= "2026-04-02T09:00:00"
  AND _time <= "2026-04-02T09:15:00"
| eval external=if(
    NOT match(requester_ip,"^10\\.|^172\\.|^192\\.168\\."),
    "EXTERNAL","INTERNAL")
| stats count by requester_ip,
    operation, external, http_status
| where external="EXTERNAL"
| sort -count`,
        highlight: 'external="EXTERNAL"',
      },
      {
        id: 'e4',
        type: 'note',
        title: 'Root Cause Analysis',
        content: `ROOT CAUSE:
  Developer ran terraform apply with
  misconfigured S3 module. Public access
  block was set to false in Terraform vars.
  Change not reviewed before deployment.

CONTRIBUTING FACTORS:
  1. No peer review on infrastructure changes
  2. Terraform variable file not in .gitignore
  3. No pre-commit Terraform security scan
  4. Dev account had prod write access

TERRAFORM REMEDIATION:
  resource "aws_s3_bucket_public_access_block" {
    bucket = aws_s3_bucket.data.id
    block_public_acls       = true
    block_public_policy     = true
    ignore_public_acls      = true
    restrict_public_buckets = true
  }`,
        highlight: 'No peer review on infrastructure changes',
      },
    ],
    mitre: [
      { technique: 'Cloud Infrastructure Discovery', id: 'T1580', tactic: 'Discovery', description: 'Misconfiguration exposed cloud storage resources to potential unauthorized discovery.' },
      { technique: 'Data from Cloud Storage', id: 'T1530', tactic: 'Collection', description: 'Publicly accessible S3 bucket created risk of unauthorized data collection.' },
      { technique: 'Valid Accounts: Cloud Accounts', id: 'T1078.004', tactic: 'Persistence', description: 'Misconfiguration introduced by valid IAM user credentials without proper access controls.' },
    ],
    response: [
      { id: 'r1', action: 'GuardDuty finding enrichment', mode: 'automated', detail: 'Lambda automatically queries GuardDuty finding details, affected resource ARN, and IAM user identity.' },
      { id: 'r2', action: 'Bucket inventory scan', mode: 'automated', detail: 'Lambda lists objects and checks naming patterns for PII indicators. Severity escalated if sensitive patterns detected.' },
      { id: 'r3', action: 'SNS alert to security team', mode: 'automated', detail: 'Structured alert with full context sent within 30 seconds of GuardDuty finding generation.' },
      { id: 'r4', action: 'Re-enable S3 public access block', mode: 'analyst-required', detail: 'Lambda prepares remediation but waits for analyst approval. Prevents accidental blocking of intentionally public buckets.' },
      { id: 'r5', action: 'Review S3 access logs', mode: 'analyst-required', detail: 'Manual review of server access logs for external downloads. Determines data breach notification requirements.' },
      { id: 'r6', action: 'IAM access review', mode: 'recommended', detail: 'Review IAM user permissions. Dev user should not have prod write access. Least-privilege enforcement.' },
    ],
    splunkQuery: `index=aws sourcetype=aws:s3:accesslogs
  bucket_name="company-data-backup-prod"
| where _time >= "2026-04-02T09:00:00"
| eval external=if(NOT match(requester_ip,"^10\\.|^172\\.|^192\\.168\\."), "EXTERNAL","INTERNAL")
| stats count by requester_ip, operation, external, http_status
| where external="EXTERNAL"
| sort -count`,
    analystConclusion: 'High severity misconfiguration. S3 public access block removed by dev IAM user via Terraform deployment error. 3-minute exposure window. No confirmed external downloads in access logs. Lambda remediation successful. Root cause: missing Terraform security scanning and peer review process.',
    lessonsLearned: 'Terraform security scanning (tfsec/checkov) added to CI/CD pipeline. S3 public access block enforced via SCP at account level. IAM least-privilege review initiated. Pre-commit hooks added for infrastructure changes.',
  },
]
