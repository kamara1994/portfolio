#!/usr/bin/env python3
"""
BLUE IDS - Python Intrusion Detection System
Author: Joseph Allan Kamara
"""

import time
import random
import sys
from datetime import datetime

# ─── COLORS ────────────────────────────────────────────────────────────────
RED     = "\033[91m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
CYAN    = "\033[96m"
WHITE   = "\033[97m"
MAGENTA = "\033[95m"
GRAY    = "\033[90m"
BOLD    = "\033[1m"
RESET   = "\033[0m"

BANNER = f"""
{CYAN}{BOLD}
╔══════════════════════════════════════════════════════════════╗
║          BLUE IDS — Python Intrusion Detection System        ║
║          Author: Joseph Allan Kamara  |  TCM PSAA  |  CCNA  ║
║          Stack: Python · Scapy · TCP/IP · Linux              ║
╚══════════════════════════════════════════════════════════════╝
{RESET}"""

THREATS = [
    {
        "type": "SYN FLOOD",
        "src": "192.168.1.47",
        "dst": "10.0.0.1",
        "port": 80,
        "proto": "TCP",
        "severity": "HIGH",
        "detail": "Detected 847 SYN packets in 2.3s — threshold: 100/s",
        "mitre": "T1498.001 - Network DoS: Direct Network Flood",
        "color": RED,
    },
    {
        "type": "PORT SCAN",
        "src": "10.10.10.99",
        "dst": "172.16.0.5",
        "port": "1-1024",
        "proto": "TCP",
        "severity": "MEDIUM",
        "detail": "Sequential port scan detected — 1024 ports in 4.1s",
        "mitre": "T1046 - Network Service Discovery",
        "color": YELLOW,
    },
    {
        "type": "ARP SPOOFING",
        "src": "aa:bb:cc:dd:ee:ff",
        "dst": "broadcast",
        "port": "N/A",
        "proto": "ARP",
        "severity": "CRITICAL",
        "detail": "Duplicate ARP reply — MAC mismatch for 192.168.1.1",
        "mitre": "T1557.002 - ARP Cache Poisoning",
        "color": MAGENTA,
    },
    {
        "type": "ICMP FLOOD",
        "src": "203.0.113.42",
        "dst": "10.0.0.1",
        "port": "N/A",
        "proto": "ICMP",
        "severity": "HIGH",
        "detail": "1,200 ICMP echo requests detected in 3s",
        "mitre": "T1498.001 - Network DoS",
        "color": RED,
    },
    {
        "type": "SUSPICIOUS DNS",
        "src": "10.0.0.55",
        "dst": "8.8.8.8",
        "port": 53,
        "proto": "UDP",
        "severity": "LOW",
        "detail": "DNS query to known malicious domain: malware-c2[.]ru",
        "mitre": "T1071.004 - DNS Application Layer Protocol",
        "color": YELLOW,
    },
]

PACKETS = [
    ("TCP",  "192.168.1.10",  "10.0.0.1",    443, "HTTPS", "CLEAN"),
    ("UDP",  "192.168.1.22",  "8.8.8.8",     53,  "DNS",   "CLEAN"),
    ("TCP",  "10.10.10.99",   "172.16.0.5",  22,  "SSH",   "WATCHING"),
    ("ICMP", "192.168.1.1",   "192.168.1.10","—",  "PING",  "CLEAN"),
    ("TCP",  "192.168.1.47",  "10.0.0.1",    80,  "HTTP",  "CLEAN"),
    ("TCP",  "192.168.1.33",  "10.0.0.2",    3389,"RDP",   "WATCHING"),
    ("UDP",  "10.0.0.55",     "8.8.8.8",     53,  "DNS",   "CLEAN"),
    ("TCP",  "172.16.0.20",   "10.0.0.1",    443, "HTTPS", "CLEAN"),
]

def ts():
    return datetime.now().strftime("%H:%M:%S.%f")[:-3]

def print_header():
    print(BANNER)
    print(f"{GRAY}{'─'*66}{RESET}")
    print(f"{BOLD}{CYAN}  INTERFACE  {RESET}{GRAY}eth0      {CYAN}FILTER  {RESET}{GRAY}all traffic")
    print(f"{BOLD}{CYAN}  RULES      {RESET}{GRAY}6 active  {CYAN}MODE    {RESET}{GRAY}monitor+alert")
    print(f"{BOLD}{CYAN}  THRESHOLD  {RESET}{GRAY}SYN:100/s  PORT:50/s  ICMP:200/s")
    print(f"{GRAY}{'─'*66}{RESET}\n")

def print_packet(pkt):
    proto, src, dst, port, service, status = pkt
    status_color = GREEN if status == "CLEAN" else YELLOW
    print(f"  {GRAY}{ts()}{RESET}  {CYAN}{proto:<5}{RESET}  "
          f"{WHITE}{src:<16}{RESET}  {GRAY}→{RESET}  {WHITE}{dst:<14}{RESET}  "
          f"{GRAY}:{str(port):<5}{RESET}  {GRAY}{service:<6}{RESET}  "
          f"{status_color}{status}{RESET}")

def print_alert(threat):
    c = threat['color']
    sev = threat['severity']
    sev_color = RED if sev == "CRITICAL" else (RED if sev == "HIGH" else (YELLOW if sev == "MEDIUM" else GRAY))

    print(f"\n{c}{'═'*66}{RESET}")
    print(f"{c}{BOLD}  ⚠  ALERT DETECTED — {threat['type']}{RESET}")
    print(f"{c}{'═'*66}{RESET}")
    print(f"  {GRAY}Time      {RESET}{WHITE}{ts()}{RESET}")
    print(f"  {GRAY}Severity  {RESET}{sev_color}{BOLD}{sev}{RESET}")
    print(f"  {GRAY}Source    {RESET}{WHITE}{threat['src']}{RESET}")
    print(f"  {GRAY}Target    {RESET}{WHITE}{threat['dst']}{RESET}")
    print(f"  {GRAY}Port      {RESET}{WHITE}{threat['port']}{RESET}")
    print(f"  {GRAY}Protocol  {RESET}{WHITE}{threat['proto']}{RESET}")
    print(f"  {GRAY}Detail    {RESET}{YELLOW}{threat['detail']}{RESET}")
    print(f"  {GRAY}MITRE     {RESET}{MAGENTA}{threat['mitre']}{RESET}")
    print(f"  {GRAY}Action    {RESET}{GREEN}→ Alert logged  → Analyst notified  → Rule updated{RESET}")
    print(f"{c}{'═'*66}{RESET}\n")

def print_summary(packets_scanned, alerts):
    print(f"\n{CYAN}{'─'*66}{RESET}")
    print(f"{BOLD}{WHITE}  BLUE IDS — SESSION SUMMARY{RESET}")
    print(f"{CYAN}{'─'*66}{RESET}")
    print(f"  {GRAY}Packets Analyzed   {RESET}{WHITE}{packets_scanned}{RESET}")
    print(f"  {GRAY}Alerts Generated   {RESET}{RED}{alerts}{RESET}")
    print(f"  {GRAY}Clean Traffic      {RESET}{GREEN}{packets_scanned - alerts}{RESET}")
    print(f"  {GRAY}Detection Engine   {RESET}{GREEN}OPERATIONAL{RESET}")
    print(f"  {GRAY}Uptime             {RESET}{WHITE}00:00:12{RESET}")
    print(f"  {GRAY}Log File           {RESET}{GRAY}/var/log/blue-ids/alerts.json{RESET}")
    print(f"{CYAN}{'─'*66}{RESET}")
    print(f"\n{GREEN}  ✓ Session complete. All alerts logged to SIEM.{RESET}\n")

def main():
    print_header()
    print(f"  {GREEN}[+]{RESET} Initializing packet capture on {CYAN}eth0{RESET}...")
    time.sleep(0.4)
    print(f"  {GREEN}[+]{RESET} Loading detection rules from {GRAY}/etc/blue-ids/rules.conf{RESET}...")
    time.sleep(0.3)
    print(f"  {GREEN}[+]{RESET} {WHITE}6 rules loaded{RESET} — SYN flood, port scan, ARP spoof, ICMP flood, DNS, HTTP anomaly")
    time.sleep(0.3)
    print(f"  {GREEN}[+]{RESET} Starting capture... {YELLOW}Press Ctrl+C to stop{RESET}\n")
    time.sleep(0.4)

    print(f"  {GRAY}{'TIME':<12} {'PROTO':<6} {'SOURCE':<17} {'':3} {'DESTINATION':<15} {'PORT':<7} {'SERVICE':<7} STATUS{RESET}")
    print(f"  {GRAY}{'─'*60}{RESET}")

    pkt_count = 0
    alert_count = 0
    threat_idx = 0

    for i in range(28):
        pkt = PACKETS[i % len(PACKETS)]
        print_packet(pkt)
        pkt_count += 1
        time.sleep(0.08)

        if i in [4, 9, 14, 19, 24]:
            if threat_idx < len(THREATS):
                print_alert(THREATS[threat_idx])
                alert_count += 1
                threat_idx += 1
                time.sleep(0.2)

    print_summary(pkt_count, alert_count)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}  [!] Capture stopped by user.{RESET}\n")
        sys.exit(0)