# AWS high availability and resilience — sanitized lab summary

ITM 400, Fall 2026. Week 7 challenge submitted October 27 (20/20); individual studio artifact submitted October 31 (24/24). Sources: Auto Scaling groups 02 screenshot, challenge score screenshot, Blue Bear Architecture Transfer Analysis, Troubleshooting Record.

The transfer analysis documents a second-AZ NAT gateway, EC2 launch template, public ALB and private-subnet Auto Scaling group across two AZs. Minimum and desired capacity: two; maximum: six. The screenshot shows 2/2 healthy instances at desired capacity. The student reports successful café website access through the ALB.

Troubleshooting: registered ALB targets initially unhealthy; checked HTTP health checks, security group port 80 and EC2 status checks. Instances were running with 2/2 status checks, and website loaded; continued monitoring recommended. Grader initially awarded 0/5 for the ASG; inspection found zero dynamic policies. Student documented adding CPU target tracking at 25% with 60-second warmup and planned a resubmission and stress test. Canvas subsequently recorded the overall 20-point result.

No completed stress test or measured failover was recovered. Instructor feedback recognized the failure analysis's database-writer and retry considerations and identified recovery objectives as targets. Production recommendations include load testing, additional failover capacity, HA database and monitoring. Account identifiers omitted.
